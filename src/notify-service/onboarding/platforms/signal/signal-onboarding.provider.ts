import { Injectable, Logger } from '@nestjs/common';
import { OnboardingProvider } from '../onboarding-provider.interface';
import type { OnboardingContext, OnboardingStep } from '../../onboarding.types';
import { SignalRestClient } from './signal-rest.client';
import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  PlatformConfigService,
  type SignalCredentials,
} from '../../../platform-config/platform-config.service';
import { SignalBridgeManager } from '../../../incoming/platforms/signal/signal-bridge.manager';
import { SignalVerificationBridgeService } from '../../../signal-verification/signal-verification-bridge.service';
import {
  SIGNAL_CAPTCHA_PAGE_URL,
  SIGNAL_CAPTCHA_TOKEN_SCHEME,
  SIGNAL_HCAPTCHA_SITEKEY,
  SIGNAL_STEP_KEYS,
  type SignalOnboardingMeta,
  type SignalOnboardingParams,
} from './signal-onboarding.types';

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

@Injectable()
export class SignalOnboardingProvider extends OnboardingProvider {
  readonly platform = 'signal';
  private readonly logger = new Logger(SignalOnboardingProvider.name);

  constructor(
    private readonly client: SignalRestClient,
    private readonly platformConfigService: PlatformConfigService,
    private readonly bridgeManager: SignalBridgeManager,
    private readonly verificationBridge: SignalVerificationBridgeService,
  ) {
    super();
  }

  async start(ctx: OnboardingContext, raw: Record<string, unknown>): Promise<OnboardingStep> {
    const params = this.parseParams(raw);
    if (!params) {
      return errorStep('INVALID_PARAMS', 'Invalid Signal onboarding parameters.', false);
    }
    if (params.intent === 'replace' && !ctx.session.tenantId) {
      return errorStep('TENANT_REQUIRED', 'Replace flow requires a tenantId.', false);
    }
    ctx.session.params = params as unknown as Record<string, unknown>;

    // 1. Resolve gateway URL.
    const userProvided = (params.apiUrl ?? '').trim();
    if (userProvided) {
      const reachable = await this.client.healthCheck(userProvided);
      if (!reachable) {
        const defaultApiUrl = await this.resolveDefaultApiUrl();
        return {
          type: 'choice',
          key: SIGNAL_STEP_KEYS.GATEWAY_CHOICE,
          data: {
            reasonCode: 'signal_gateway_unreachable',
            context: { apiUrl: userProvided, defaultApiUrl },
            options: [{ value: 'use_default' }, { value: 'cancel' }],
          },
        };
      }
      this.setMeta(ctx, { resolvedApiUrl: userProvided });
    } else {
      const defaultApiUrl = await this.resolveDefaultApiUrl();
      if (!defaultApiUrl) {
        return errorStep('NO_DEFAULT_GATEWAY', 'No default Signal gateway is configured.', false);
      }
      this.setMeta(ctx, { resolvedApiUrl: defaultApiUrl });
    }

    return this.beginRegistrationOrLink(ctx);
  }

  async submit(ctx: OnboardingContext, stepKey: string, payload: Record<string, unknown>): Promise<OnboardingStep> {
    switch (stepKey) {
      case SIGNAL_STEP_KEYS.GATEWAY_CHOICE:
        return this.handleGatewayChoice(ctx, payload);
      case SIGNAL_STEP_KEYS.QRCODE_CONFIRM:
        return this.handleQrConfirm(ctx);
      case SIGNAL_STEP_KEYS.CAPTCHA_TOKEN:
        return this.handleCaptchaToken(ctx, payload);
      case SIGNAL_STEP_KEYS.VERIFY_CODE:
        return this.handleVerifyCode(ctx, payload);
      default:
        return errorStep('UNKNOWN_STEP', `Unknown step "${stepKey}".`, false);
    }
  }

  async cancel(ctx: OnboardingContext): Promise<void> {
    // No upstream session to drop — signal-cli REST is stateless per call —
    // but the verification bridge's pending flag has to come down so a stale
    // SMS arriving during the next session doesn't auto-fill an old account.
    const account = (ctx.session.params as Partial<SignalOnboardingParams> | undefined)?.account;
    if (account) {
      await this.verificationBridge.clearPending(account);
    }
  }

  // ----- step handlers ------------------------------------------------------

  private async handleGatewayChoice(ctx: OnboardingContext, payload: Record<string, unknown>): Promise<OnboardingStep> {
    const choice = typeof payload.choice === 'string' ? payload.choice : '';
    if (choice === 'cancel') {
      return errorStep('USER_CANCELLED', 'User cancelled — gateway unreachable.', false);
    }
    if (choice !== 'use_default') {
      return errorStep('INVALID_CHOICE', `Unknown choice "${choice}".`, true);
    }
    const defaultApiUrl = await this.resolveDefaultApiUrl();
    if (!defaultApiUrl) {
      return errorStep('NO_DEFAULT_GATEWAY', 'No default Signal gateway is configured.', false);
    }
    // Replace user's apiUrl in params and meta so subsequent steps + the final
    // credentials write use the default.
    const params = this.params(ctx);
    params.apiUrl = defaultApiUrl;
    ctx.session.params = params as unknown as Record<string, unknown>;
    this.setMeta(ctx, { resolvedApiUrl: defaultApiUrl });

    return this.beginRegistrationOrLink(ctx);
  }

  private async handleQrConfirm(ctx: OnboardingContext): Promise<OnboardingStep> {
    // After the user scans the QR, signal-cli REST registers the device on
    // its side. We confirm by listing accounts and checking ours appears.
    const apiUrl = this.requireApiUrl(ctx);
    const params = this.params(ctx);
    const accounts = await this.client.listAccounts(apiUrl);
    const linked = accounts.includes(params.account);
    if (!linked) {
      return errorStep(
        'LINK_NOT_DETECTED',
        'Linking not yet detected on the gateway. Re-scan the QR code and try again.',
        true,
      );
    }
    return this.successDone(ctx);
  }

  private async handleCaptchaToken(ctx: OnboardingContext, payload: Record<string, unknown>): Promise<OnboardingStep> {
    const token = (typeof payload.captchaToken === 'string' ? payload.captchaToken : '').trim();
    if (!token.startsWith('signalcaptcha://')) {
      return errorStep('INVALID_CAPTCHA_TOKEN', 'Captcha token has an unexpected format.', true);
    }
    this.setMeta(ctx, { captchaToken: token });

    const apiUrl = this.requireApiUrl(ctx);
    const params = this.params(ctx);
    const result = await this.client.register(apiUrl, params.account, {
      use_voice: false,
      captcha: token,
    });
    if (!result.ok) {
      if (result.error.kind === 'captcha_required') {
        // Token rejected — re-emit captcha step so the user can solve again.
        return this.captchaStep();
      }
      if (result.error.kind === 'rate_limited') {
        return errorStep('RATE_LIMITED', 'Too many registration attempts. Try again later.', true);
      }
      return errorStep('REGISTER_FAILED', result.error.message, true);
    }
    this.setMeta(ctx, { registrationStarted: true });
    return this.enterVerificationStep(params.account);
  }

  private async handleVerifyCode(ctx: OnboardingContext, payload: Record<string, unknown>): Promise<OnboardingStep> {
    const code = (typeof payload.code === 'string' ? payload.code : '').trim();
    if (!/^\d{3}-?\d{3}$/.test(code) && !/^\d{6}$/.test(code)) {
      return errorStep('INVALID_CODE', 'Verification code must be 6 digits.', true);
    }
    const apiUrl = this.requireApiUrl(ctx);
    const params = this.params(ctx);
    const pin = typeof payload.pin === 'string' && payload.pin.length > 0 ? payload.pin : undefined;
    const verified = await this.client.verify(apiUrl, params.account, code.replace('-', ''), pin);
    if (!verified.ok) {
      return errorStep('VERIFY_FAILED', verified.message ?? 'Verification failed.', true);
    }
    return this.successDone(ctx);
  }

  // ----- shared helpers -----------------------------------------------------

  private async beginRegistrationOrLink(ctx: OnboardingContext): Promise<OnboardingStep> {
    const params = this.params(ctx);
    const apiUrl = this.requireApiUrl(ctx);

    if (params.mode === 'link') {
      const { pngBase64 } = await this.client.getQrCodeLink(apiUrl, params.deviceName ?? 'open-gate');
      return {
        type: 'qrcode',
        key: SIGNAL_STEP_KEYS.QRCODE_CONFIRM,
        data: {
          qrPngBase64: pngBase64,
          instructions: [
            'open_signal_app',
            'go_to_linked_devices',
            'tap_plus_add_device',
            'scan_qr_code',
            'press_continue_when_done',
          ],
        },
      };
    }

    // Mode: register a new phone number.
    const result = await this.client.register(apiUrl, params.account, { use_voice: false });
    if (result.ok) {
      this.setMeta(ctx, { registrationStarted: true });
      return this.enterVerificationStep(params.account);
    }
    if (result.error.kind === 'captcha_required') {
      return this.captchaStep();
    }
    if (result.error.kind === 'rate_limited') {
      return errorStep('RATE_LIMITED', 'Too many registration attempts. Try again later.', true);
    }
    if (result.error.kind === 'invalid_number') {
      return errorStep('INVALID_NUMBER', 'Phone number is invalid.', true);
    }
    return errorStep('REGISTER_FAILED', result.error.message, true);
  }

  private captchaStep(): OnboardingStep {
    return {
      type: 'captcha',
      key: SIGNAL_STEP_KEYS.CAPTCHA_TOKEN,
      data: {
        captchaUrl: SIGNAL_CAPTCHA_PAGE_URL,
        tokenScheme: SIGNAL_CAPTCHA_TOKEN_SCHEME,
        siteKey: SIGNAL_HCAPTCHA_SITEKEY,
        instructions: ['solve_hcaptcha', 'token_will_be_captured_automatically'],
      },
    };
  }

  private verificationCodeStep(recipient: string): OnboardingStep {
    return {
      type: 'verification_code',
      key: SIGNAL_STEP_KEYS.VERIFY_CODE,
      data: { channel: 'sms', recipient },
    };
  }

  /**
   * Marks the verification bridge so an inbound SMS to the account's
   * number can auto-supply the code, then returns the step the client
   * should render. Keyed on `account` (E.164) — same value the Twilio
   * webhook sees in `To`, and works for both wizard (tenantId still
   * null) and settings flows.
   *
   * The flag stays up until cancel(), successDone(), or its 10-minute
   * TTL — retriable verify failures keep it active so the user can
   * paste a corrected code.
   */
  private async enterVerificationStep(recipient: string): Promise<OnboardingStep> {
    await this.verificationBridge.markPending(recipient);
    return this.verificationCodeStep(recipient);
  }

  /**
   * Final step. For replace flow, best-effort unregisters the previous
   * account on the same gateway — we don't fail the whole flow if this
   * cleanup call errors out.
   */
  private async successDone(ctx: OnboardingContext): Promise<OnboardingStep> {
    const params = this.params(ctx);
    const apiUrl = this.requireApiUrl(ctx);
    if (params.intent === 'replace' && params.previousAccount && params.previousAccount !== params.account) {
      const result = await this.client.unregister(apiUrl, params.previousAccount);
      if (!result.ok) {
        this.logger.warn(
          `Unregister of previous account ${params.previousAccount} failed: ${result.message ?? '(no detail)'}`,
        );
      }
    }
    const credentials: SignalCredentials = { apiUrl, account: params.account };

    // Refresh the bridge for an existing tenant so the WS reconnects with
    // the new credentials immediately, in parallel with the BFF persisting
    // them. Wizard flow (no tenantId) is picked up by the bridge's periodic
    // reconcile loop after the tenant is created and its row appears in
    // platform_credentials.
    if (ctx.session.tenantId) {
      try {
        await this.bridgeManager.refreshTenant(ctx.session.tenantId, credentials);
      } catch (err) {
        this.logger.warn(`Bridge refresh failed for tenant ${ctx.session.tenantId}: ${String(err)}`);
      }
    }
    await this.verificationBridge.clearPending(params.account);

    return {
      type: 'done',
      key: 'done',
      data: { credentialsJson: JSON.stringify(credentials) },
    };
  }

  private async resolveDefaultApiUrl(): Promise<string | null> {
    const cfg = await this.platformConfigService.getConfig(DEFAULT_PLATFORM_FALLBACK_ID, 'signal');
    if (cfg?.apiUrl) return cfg.apiUrl;
    const env = this.platformConfigService.envFallback('signal') as SignalCredentials | null;
    return env?.apiUrl ?? null;
  }

  private parseParams(raw: Record<string, unknown>): SignalOnboardingParams | null {
    const account = typeof raw.account === 'string' ? raw.account.trim() : '';
    if (!E164_REGEX.test(account)) return null;
    const mode = raw.mode === 'link' || raw.mode === 'register' ? raw.mode : null;
    if (!mode) return null;
    const intent = raw.intent === 'replace' || raw.intent === 'initial' ? raw.intent : null;
    if (!intent) return null;
    return {
      account,
      mode,
      intent,
      apiUrl: typeof raw.apiUrl === 'string' && raw.apiUrl.trim() !== '' ? raw.apiUrl.trim() : undefined,
      previousAccount:
        typeof raw.previousAccount === 'string' && raw.previousAccount.trim() !== ''
          ? raw.previousAccount.trim()
          : undefined,
      deviceName: typeof raw.deviceName === 'string' && raw.deviceName.length > 0 ? raw.deviceName : undefined,
    };
  }

  private params(ctx: OnboardingContext): SignalOnboardingParams {
    return ctx.session.params as unknown as SignalOnboardingParams;
  }

  private setMeta(ctx: OnboardingContext, patch: Partial<SignalOnboardingMeta>): void {
    ctx.session.meta = { ...(ctx.session.meta as SignalOnboardingMeta), ...patch };
  }

  private requireApiUrl(ctx: OnboardingContext): string {
    const meta = ctx.session.meta as SignalOnboardingMeta;
    if (!meta.resolvedApiUrl) throw new Error('Signal onboarding: resolvedApiUrl missing in session meta.');
    return meta.resolvedApiUrl;
  }
}

function errorStep(code: string, message: string, retriable: boolean): OnboardingStep {
  return { type: 'error', key: 'error', data: { code, message, retriable } };
}
