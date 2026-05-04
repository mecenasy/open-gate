import type { OnboardingContext, OnboardingSession } from '../../onboarding.types';
import type { PlatformConfigService, SignalCredentials } from '../../../platform-config/platform-config.service';
import { DEFAULT_PLATFORM_FALLBACK_ID } from '../../../platform-config/platform-config.service';
import type { SignalBridgeManager } from '../../../incoming/platforms/signal/signal-bridge.manager';
import type { SignalVerificationBridgeService } from '../../../signal-verification/signal-verification-bridge.service';
import type { SignalRegisterError, SignalRestClient } from './signal-rest.client';
import { SIGNAL_STEP_KEYS } from './signal-onboarding.types';
import { SignalOnboardingProvider } from './signal-onboarding.provider';

function makeSession(over: Partial<OnboardingSession> = {}): OnboardingSession {
  return {
    sessionId: 's-1',
    tenantId: undefined,
    platform: 'signal',
    params: {},
    meta: {},
    expectedStepKey: 'start',
    createdAt: '2026-05-04T10:00:00Z',
    updatedAt: '2026-05-04T10:00:00Z',
    ...over,
  };
}

function ctx(session: OnboardingSession = makeSession()): OnboardingContext {
  return { session };
}

function regErr(kind: SignalRegisterError['kind'], message = 'msg', status?: number): SignalRegisterError {
  return { kind, message, status };
}

describe('SignalOnboardingProvider', () => {
  let client: jest.Mocked<SignalRestClient>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let bridge: jest.Mocked<SignalBridgeManager>;
  let verify: jest.Mocked<SignalVerificationBridgeService>;
  let provider: SignalOnboardingProvider;

  beforeEach(() => {
    client = {
      healthCheck: jest.fn(),
      getQrCodeLink: jest.fn(),
      register: jest.fn(),
      verify: jest.fn(),
      unregister: jest.fn(),
      listAccounts: jest.fn(),
    } as unknown as jest.Mocked<SignalRestClient>;

    cfg = {
      getConfig: jest.fn(),
      envFallback: jest.fn(),
    } as unknown as jest.Mocked<PlatformConfigService>;

    bridge = {
      refreshTenant: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SignalBridgeManager>;

    verify = {
      markPending: jest.fn().mockResolvedValue(undefined),
      clearPending: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SignalVerificationBridgeService>;

    provider = new SignalOnboardingProvider(client, cfg, bridge, verify);
    jest
      .spyOn((provider as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  it('exposes platform="signal"', () => {
    expect(provider.platform).toBe('signal');
  });

  describe('start', () => {
    const baseParams = { account: '+48111222333', mode: 'register' as const, intent: 'initial' as const };

    it('rejects malformed E.164', async () => {
      const step = await provider.start(ctx(), { ...baseParams, account: '12345' });
      expect(step.type).toBe('error');
      expect((step.data as { code: string }).code).toBe('INVALID_PARAMS');
    });

    it('rejects when intent=replace without tenantId', async () => {
      const step = await provider.start(ctx(), { ...baseParams, intent: 'replace' });
      expect(step.type).toBe('error');
      expect((step.data as { code: string }).code).toBe('TENANT_REQUIRED');
    });

    it('emits gateway_choice when user-supplied apiUrl is unreachable', async () => {
      client.healthCheck.mockResolvedValue(false);
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://default:8080', account: 'x' } as SignalCredentials);

      const step = await provider.start(ctx(), { ...baseParams, apiUrl: 'http://broken:8080' });
      expect(step.type).toBe('choice');
      expect(step.key).toBe(SIGNAL_STEP_KEYS.GATEWAY_CHOICE);
      const data = step.data as { context: { defaultApiUrl: string }; options: Array<{ value: string }> };
      expect(data.context.defaultApiUrl).toBe('http://default:8080');
      expect(data.options.map((o) => o.value)).toEqual(['use_default', 'cancel']);
    });

    it('errors when apiUrl is missing AND no default is configured', async () => {
      cfg.getConfig.mockResolvedValue(null);
      cfg.envFallback.mockReturnValue(null);

      const step = await provider.start(ctx(), baseParams);
      expect(step.type).toBe('error');
      expect((step.data as { code: string }).code).toBe('NO_DEFAULT_GATEWAY');
    });

    it('register mode → captcha step when register returns captcha_required', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.register.mockResolvedValue({ ok: false, error: regErr('captcha_required', 'msg', 402) });

      const session = makeSession();
      const step = await provider.start(ctx(session), baseParams);

      expect(step.type).toBe('captcha');
      expect(step.key).toBe(SIGNAL_STEP_KEYS.CAPTCHA_TOKEN);
      const meta = session.meta as { resolvedApiUrl?: string };
      expect(meta.resolvedApiUrl).toBe('http://signal:8080');
    });

    it('register mode → verification_code on success and marks pending', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.register.mockResolvedValue({ ok: true });

      const step = await provider.start(ctx(), baseParams);

      expect(step.type).toBe('verification_code');
      expect(step.key).toBe(SIGNAL_STEP_KEYS.VERIFY_CODE);
      expect(verify.markPending).toHaveBeenCalledWith('+48111222333');
    });

    it('register mode → RATE_LIMITED retriable error on 429', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.register.mockResolvedValue({ ok: false, error: regErr('rate_limited', 'too many', 429) });

      const step = await provider.start(ctx(), baseParams);
      expect(step.type).toBe('error');
      expect((step.data as { code: string; retriable: boolean }).code).toBe('RATE_LIMITED');
      expect((step.data as { retriable: boolean }).retriable).toBe(true);
    });

    it('register mode → INVALID_NUMBER error', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.register.mockResolvedValue({ ok: false, error: regErr('invalid_number', 'bad', 400) });

      const step = await provider.start(ctx(), baseParams);
      expect((step.data as { code: string }).code).toBe('INVALID_NUMBER');
    });

    it('register mode → REGISTER_FAILED on "other" error kind', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.register.mockResolvedValue({ ok: false, error: regErr('other', 'internal', 500) });

      const step = await provider.start(ctx(), baseParams);
      expect((step.data as { code: string }).code).toBe('REGISTER_FAILED');
    });

    it('link mode → qrcode step', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.getQrCodeLink.mockResolvedValue({ pngBase64: 'PNGBASE64' });

      const step = await provider.start(ctx(), { ...baseParams, mode: 'link', deviceName: 'open-gate' });

      expect(step.type).toBe('qrcode');
      expect(step.key).toBe(SIGNAL_STEP_KEYS.QRCODE_CONFIRM);
      expect((step.data as { qrPngBase64: string }).qrPngBase64).toBe('PNGBASE64');
      expect(client.getQrCodeLink).toHaveBeenCalledWith('http://signal:8080', 'open-gate');
    });

    it('link mode falls back to "open-gate" when deviceName is empty', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: 'x' } as SignalCredentials);
      client.getQrCodeLink.mockResolvedValue({ pngBase64: 'p' });

      await provider.start(ctx(), { ...baseParams, mode: 'link' });
      expect(client.getQrCodeLink).toHaveBeenCalledWith('http://signal:8080', 'open-gate');
    });

    it('uses envFallback apiUrl when DB has no default', async () => {
      cfg.getConfig.mockResolvedValue(null);
      cfg.envFallback.mockReturnValue({ apiUrl: 'http://env:9999', account: 'x' });
      client.register.mockResolvedValue({ ok: true });

      await provider.start(ctx(), baseParams);
      // proves envFallback was used to resolve default before register call:
      expect(client.register).toHaveBeenCalledWith('http://env:9999', '+48111222333', { use_voice: false });
    });
  });

  describe('submit', () => {
    function startedSession(over: Partial<OnboardingSession> = {}): OnboardingSession {
      return makeSession({
        params: { account: '+48111222333', mode: 'register', intent: 'initial' },
        meta: { resolvedApiUrl: 'http://signal:8080' },
        ...over,
      });
    }

    it('handles GATEWAY_CHOICE=cancel → USER_CANCELLED', async () => {
      const step = await provider.submit(ctx(makeSession()), SIGNAL_STEP_KEYS.GATEWAY_CHOICE, { choice: 'cancel' });
      expect((step.data as { code: string }).code).toBe('USER_CANCELLED');
    });

    it('handles GATEWAY_CHOICE with unknown value → INVALID_CHOICE retriable', async () => {
      const step = await provider.submit(ctx(makeSession()), SIGNAL_STEP_KEYS.GATEWAY_CHOICE, { choice: 'wat' });
      expect((step.data as { code: string }).code).toBe('INVALID_CHOICE');
      expect((step.data as { retriable: boolean }).retriable).toBe(true);
    });

    it('handles GATEWAY_CHOICE=use_default → re-runs register with default URL', async () => {
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://default:8080', account: 'x' } as SignalCredentials);
      client.register.mockResolvedValue({ ok: true });

      const session = makeSession({ params: { account: '+48111222333', mode: 'register', intent: 'initial' } });
      const step = await provider.submit(ctx(session), SIGNAL_STEP_KEYS.GATEWAY_CHOICE, { choice: 'use_default' });

      expect(client.register).toHaveBeenCalledWith('http://default:8080', '+48111222333', { use_voice: false });
      expect(step.type).toBe('verification_code');
      const params = session.params as { apiUrl?: string };
      expect(params.apiUrl).toBe('http://default:8080');
    });

    it('handles GATEWAY_CHOICE=use_default but no default exists → NO_DEFAULT_GATEWAY', async () => {
      cfg.getConfig.mockResolvedValue(null);
      cfg.envFallback.mockReturnValue(null);

      const step = await provider.submit(ctx(makeSession()), SIGNAL_STEP_KEYS.GATEWAY_CHOICE, {
        choice: 'use_default',
      });
      expect((step.data as { code: string }).code).toBe('NO_DEFAULT_GATEWAY');
    });

    it('handles QRCODE_CONFIRM → done when account is now linked', async () => {
      client.listAccounts.mockResolvedValue(['+48111222333', '+48999']);

      const session = startedSession({
        params: { account: '+48111222333', mode: 'link', intent: 'initial' },
      });
      const step = await provider.submit(ctx(session), SIGNAL_STEP_KEYS.QRCODE_CONFIRM, {});

      expect(step.type).toBe('done');
      expect((step.data as { credentialsJson: string }).credentialsJson).toContain('+48111222333');
    });

    it('handles QRCODE_CONFIRM → LINK_NOT_DETECTED retriable when account not in list', async () => {
      client.listAccounts.mockResolvedValue(['+48999']);

      const step = await provider.submit(
        ctx(startedSession({ params: { account: '+48111222333', mode: 'link', intent: 'initial' } })),
        SIGNAL_STEP_KEYS.QRCODE_CONFIRM,
        {},
      );

      expect((step.data as { code: string }).code).toBe('LINK_NOT_DETECTED');
      expect((step.data as { retriable: boolean }).retriable).toBe(true);
    });

    it('handles CAPTCHA_TOKEN → INVALID_CAPTCHA_TOKEN when scheme wrong', async () => {
      const step = await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.CAPTCHA_TOKEN, {
        captchaToken: 'bad-token',
      });
      expect((step.data as { code: string }).code).toBe('INVALID_CAPTCHA_TOKEN');
    });

    it('handles CAPTCHA_TOKEN success → verification_code step + markPending', async () => {
      client.register.mockResolvedValue({ ok: true });

      const session = startedSession();
      const step = await provider.submit(ctx(session), SIGNAL_STEP_KEYS.CAPTCHA_TOKEN, {
        captchaToken: 'signalcaptcha://signal-hcaptcha.x.registration.y',
      });

      expect(step.type).toBe('verification_code');
      expect(verify.markPending).toHaveBeenCalledWith('+48111222333');
      expect(client.register).toHaveBeenCalledWith(
        'http://signal:8080',
        '+48111222333',
        expect.objectContaining({ use_voice: false, captcha: 'signalcaptcha://signal-hcaptcha.x.registration.y' }),
      );
    });

    it('handles CAPTCHA_TOKEN that gets rejected → re-emit captcha step', async () => {
      client.register.mockResolvedValue({ ok: false, error: regErr('captcha_required') });

      const step = await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.CAPTCHA_TOKEN, {
        captchaToken: 'signalcaptcha://x',
      });
      expect(step.type).toBe('captcha');
    });

    it('handles CAPTCHA_TOKEN with rate_limited → RATE_LIMITED', async () => {
      client.register.mockResolvedValue({ ok: false, error: regErr('rate_limited') });

      const step = await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.CAPTCHA_TOKEN, {
        captchaToken: 'signalcaptcha://x',
      });
      expect((step.data as { code: string }).code).toBe('RATE_LIMITED');
    });

    it('handles CAPTCHA_TOKEN with other error → REGISTER_FAILED', async () => {
      client.register.mockResolvedValue({ ok: false, error: regErr('other', 'detail') });

      const step = await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.CAPTCHA_TOKEN, {
        captchaToken: 'signalcaptcha://x',
      });
      expect((step.data as { code: string; message: string }).code).toBe('REGISTER_FAILED');
      expect((step.data as { message: string }).message).toBe('detail');
    });

    it('handles VERIFY_CODE → INVALID_CODE when format is bad', async () => {
      const step = await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.VERIFY_CODE, { code: 'abc' });
      expect((step.data as { code: string }).code).toBe('INVALID_CODE');
    });

    it('handles VERIFY_CODE with dashed format and pin', async () => {
      client.verify.mockResolvedValue({ ok: true });

      const session = startedSession();
      const step = await provider.submit(ctx(session), SIGNAL_STEP_KEYS.VERIFY_CODE, { code: '123-456', pin: '0000' });

      expect(client.verify).toHaveBeenCalledWith('http://signal:8080', '+48111222333', '123456', '0000');
      expect(step.type).toBe('done');
    });

    it('handles VERIFY_CODE with empty pin treated as undefined', async () => {
      client.verify.mockResolvedValue({ ok: true });
      await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.VERIFY_CODE, { code: '123456', pin: '' });
      expect(client.verify).toHaveBeenCalledWith('http://signal:8080', '+48111222333', '123456', undefined);
    });

    it('handles VERIFY_CODE failure → VERIFY_FAILED retriable', async () => {
      client.verify.mockResolvedValue({ ok: false, message: 'bad code' });
      const step = await provider.submit(ctx(startedSession()), SIGNAL_STEP_KEYS.VERIFY_CODE, { code: '123456' });
      expect((step.data as { code: string; retriable: boolean }).code).toBe('VERIFY_FAILED');
      expect((step.data as { retriable: boolean }).retriable).toBe(true);
    });

    it('rejects unknown step keys', async () => {
      const step = await provider.submit(ctx(startedSession()), 'mystery', {});
      expect((step.data as { code: string }).code).toBe('UNKNOWN_STEP');
    });

    it('successDone refreshes bridge for tenant flow + clears pending', async () => {
      client.verify.mockResolvedValue({ ok: true });

      const session = startedSession({ tenantId: 't-7' });
      await provider.submit(ctx(session), SIGNAL_STEP_KEYS.VERIFY_CODE, { code: '123456' });

      expect(bridge.refreshTenant).toHaveBeenCalledWith('t-7', {
        apiUrl: 'http://signal:8080',
        account: '+48111222333',
      });
      expect(verify.clearPending).toHaveBeenCalledWith('+48111222333');
    });

    it('successDone unregisters previous account (replace flow)', async () => {
      client.verify.mockResolvedValue({ ok: true });
      client.unregister.mockResolvedValue({ ok: true });

      const session = startedSession({
        tenantId: 't-7',
        params: {
          account: '+48111222333',
          mode: 'register',
          intent: 'replace',
          previousAccount: '+48000111222',
        },
      });
      await provider.submit(ctx(session), SIGNAL_STEP_KEYS.VERIFY_CODE, { code: '123456' });

      expect(client.unregister).toHaveBeenCalledWith('http://signal:8080', '+48000111222');
    });

    it('successDone logs (does not throw) when unregister of previous account fails', async () => {
      client.verify.mockResolvedValue({ ok: true });
      client.unregister.mockResolvedValue({ ok: false, message: 'gone' });

      const step = await provider.submit(
        ctx(
          startedSession({
            tenantId: 't-7',
            params: {
              account: '+48111222333',
              mode: 'register',
              intent: 'replace',
              previousAccount: '+48000111222',
            },
          }),
        ),
        SIGNAL_STEP_KEYS.VERIFY_CODE,
        { code: '123456' },
      );
      expect(step.type).toBe('done');
    });

    it('successDone swallows bridge.refreshTenant rejection', async () => {
      client.verify.mockResolvedValue({ ok: true });
      bridge.refreshTenant.mockRejectedValue(new Error('bridge down'));

      const step = await provider.submit(ctx(startedSession({ tenantId: 't-7' })), SIGNAL_STEP_KEYS.VERIFY_CODE, {
        code: '123456',
      });
      expect(step.type).toBe('done');
    });
  });

  describe('cancel', () => {
    it('clears pending verification when account is set in params', async () => {
      const session = makeSession({ params: { account: '+48111' } });
      await provider.cancel(ctx(session));
      expect(verify.clearPending).toHaveBeenCalledWith('+48111');
    });

    it('is a no-op when params has no account', async () => {
      await provider.cancel(ctx(makeSession()));
      expect(verify.clearPending).not.toHaveBeenCalled();
    });
  });

  it('uses DEFAULT_PLATFORM_FALLBACK_ID for default-config lookup', async () => {
    cfg.getConfig.mockResolvedValue({ apiUrl: 'http://default:8080', account: 'x' } as SignalCredentials);
    client.register.mockResolvedValue({ ok: true });

    await provider.start(ctx(), { account: '+48111222333', mode: 'register', intent: 'initial' });

    expect(cfg.getConfig).toHaveBeenCalledWith(DEFAULT_PLATFORM_FALLBACK_ID, 'signal');
  });
});
