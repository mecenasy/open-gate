import { Controller, Logger } from '@nestjs/common';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import {
  AvailablePhoneNumberEntry,
  GetActiveProviderInfoRequest,
  GetActiveProviderInfoResponse,
  GetSignalVerificationCodeRequest,
  GetSignalVerificationCodeResponse,
  ListAvailableNumbersRequest,
  ListAvailableNumbersResponse,
  MutationResponse,
  PendingPurchaseResponse,
  PhoneCapabilitiesEntry,
  PhoneProcurementNotifyServiceController,
  PhoneProcurementNotifyServiceControllerMethods,
  PurchasePhoneNumberRequest,
  ReleasePendingPurchaseRequest,
  TwilioWebhookRequest,
  TwilioWebhookResponse,
} from 'src/proto/phone-procurement';
import { PhoneProcurementService } from './phone-procurement.service';
import { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import { SignalVerificationBridgeService } from '../signal-verification/signal-verification-bridge.service';
import { DEFAULT_PLATFORM_FALLBACK_ID, PlatformConfigService } from '../platform-config/platform-config.service';
import { TwilioBridgeService } from './twilio-webhook/twilio-bridge.service';
import type { AvailableNumber, PhoneCapabilities } from './phone-procurement.types';
import type { TwilioSmsWebhookPayloadWithMedia } from '../incoming/platforms/twilio/twilio.types';

const VOICE_HANGUP_TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="pl-PL">Ten numer obsługuje tylko wiadomości SMS. Skontaktuj się przez SMS.</Say>
  <Hangup/>
</Response>`;

/**
 * gRPC adapter exposing the phone-procurement facade to BFF. Wraps the
 * provider call + the matching pending_phone_purchases row in one
 * operation so the BFF resolver doesn't have to orchestrate two gRPC
 * round-trips for what's logically atomic ("buy and book it" / "release
 * and forget it").
 *
 * Webhook URL configuration is derived from WEBHOOK_BASE_URL (set by
 * env) — we register both the SMS and voice URLs at purchase time so
 * the number is operational immediately. If no base URL is configured
 * (dev without exposed webhooks) the provider falls back to its own
 * defaults — Twilio leaves the number unconfigured, mock no-ops.
 */
@Controller()
@PhoneProcurementNotifyServiceControllerMethods()
export class PhoneProcurementNotifyController implements PhoneProcurementNotifyServiceController {
  private readonly logger = new Logger(PhoneProcurementNotifyController.name);

  constructor(
    private readonly procurement: PhoneProcurementService,
    private readonly dbClient: PhoneProcurementDbClient,
    private readonly verificationBridge: SignalVerificationBridgeService,
    private readonly platformConfig: PlatformConfigService,
    private readonly twilioBridge: TwilioBridgeService,
  ) {}

  async listAvailableNumbers({
    country,
    type,
    limit,
  }: ListAvailableNumbersRequest): Promise<ListAvailableNumbersResponse> {
    try {
      const numbers = await this.procurement.listAvailable({
        country,
        type: parseType(type),
        limit: limit > 0 ? limit : undefined,
      });
      return {
        status: true,
        message: 'OK',
        numbers: numbers.map(toAvailableEntry),
      };
    } catch (err) {
      this.logger.error(`listAvailable failed: ${stringifyError(err)}`);
      return { status: false, message: stringifyError(err), numbers: [] };
    }
  }

  async purchasePhoneNumber(req: PurchasePhoneNumberRequest): Promise<PendingPurchaseResponse> {
    try {
      const result = await this.procurement.purchase({
        country: req.country,
        phoneE164: req.phoneE164,
        webhookSmsUrl: this.webhookUrl('sms'),
        webhookVoiceUrl: this.webhookUrl('voice'),
      });

      const pending = await this.dbClient.insertPendingPurchase({
        ownerUserId: req.ownerUserId,
        providerKey: this.procurement.getActiveProviderKey(),
        providerExternalId: result.externalId,
        phoneE164: result.phoneE164,
      });

      if (!pending) {
        // DB write failed after a real provider purchase — release to keep
        // the operator and our state in sync. The cleanup cron would
        // otherwise pick this up after 24h, paying the rent in between.
        this.logger.error(`DB insert failed after purchase ${result.externalId}; releasing immediately.`);
        await this.procurement
          .release(result.externalId)
          .catch((err) =>
            this.logger.error(`Compensating release failed for ${result.externalId}: ${stringifyError(err)}`),
          );
        return { status: false, message: 'Failed to persist purchase', entry: undefined };
      }

      return { status: true, message: 'OK', entry: pending };
    } catch (err) {
      this.logger.error(`purchase failed: ${stringifyError(err)}`);
      return { status: false, message: stringifyError(err), entry: undefined };
    }
  }

  async releasePendingPurchase(req: ReleasePendingPurchaseRequest): Promise<MutationResponse> {
    try {
      const pending = await this.dbClient.getPendingPurchase(req.pendingId);
      if (!pending) {
        return { status: false, message: 'Pending purchase not found' };
      }
      if (pending.ownerUserId !== req.ownerUserId) {
        return { status: false, message: 'Not the owner of this pending purchase' };
      }
      if (pending.attachedToTenantId) {
        return { status: false, message: 'Pending purchase is already attached and cannot be released' };
      }

      await this.procurement.releaseFromProvider(pending.providerKey, pending.providerExternalId);
      await this.dbClient.deletePendingPurchase(pending.id);
      return { status: true, message: 'OK' };
    } catch (err) {
      this.logger.error(`release failed: ${stringifyError(err)}`);
      return { status: false, message: stringifyError(err) };
    }
  }

  getActiveProviderInfo(_: GetActiveProviderInfoRequest): GetActiveProviderInfoResponse {
    return {
      status: true,
      providerKey: this.procurement.getActiveProviderKey(),
      isSandbox: this.procurement.isSandbox(),
    };
  }

  async getSignalVerificationCode({
    phoneE164,
  }: GetSignalVerificationCodeRequest): Promise<GetSignalVerificationCodeResponse> {
    const recorded = await this.verificationBridge.getCode(phoneE164);
    if (!recorded) {
      return { status: true, code: '', receivedAt: '' };
    }
    return { status: true, code: recorded.code, receivedAt: recorded.receivedAt };
  }

  /**
   * Receives Twilio webhooks proxied by BFF (the only public surface).
   * Validates X-Twilio-Signature against the master auth token, then for
   * `kind='sms'` runs the bridge (verification short-circuit + tenant
   * routing), for `kind='voice'` returns a polite-hangup TwiML.
   *
   * Returns status:true even when the lookup misses — Twilio retries on
   * non-2xx and we don't want retries for messages we can't route. BFF
   * mirrors the status into the HTTP code it returns to Twilio.
   */
  async handleTwilioWebhook(req: TwilioWebhookRequest): Promise<TwilioWebhookResponse> {
    if (!req.signature) {
      return { status: false, message: 'Missing X-Twilio-Signature header.', twiml: '' };
    }
    const master = await this.platformConfig.getConfig(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
    if (!master?.token) {
      this.logger.error('Twilio webhook rejected: master auth token unavailable.');
      return { status: false, message: 'Master auth token unavailable.', twiml: '' };
    }
    const formFields = req.formFields ?? {};
    const valid = validateRequest(master.token, req.signature, req.fullUrl, formFields);
    if (!valid) {
      this.logger.warn(`Twilio webhook rejected: signature mismatch (url=${req.fullUrl}).`);
      return { status: false, message: 'Signature mismatch.', twiml: '' };
    }

    if (req.kind === 'voice') {
      return { status: true, message: 'OK', twiml: VOICE_HANGUP_TWIML };
    }

    if (req.kind !== 'sms') {
      return { status: false, message: `Unknown webhook kind '${req.kind}'.`, twiml: '' };
    }

    try {
      await this.twilioBridge.handleInboundSms(formFields as TwilioSmsWebhookPayloadWithMedia);
      return { status: true, message: 'OK', twiml: '' };
    } catch (err) {
      this.logger.error(`Twilio SMS bridge failed: ${stringifyError(err)}`);
      // Still status:true so Twilio doesn't retry — the message is logged
      // and we'd rather investigate than re-process a likely-broken payload.
      return { status: true, message: 'Bridge error logged; not retrying.', twiml: '' };
    }
  }

  private webhookUrl(path: 'sms' | 'voice'): string | undefined {
    const base = process.env.WEBHOOK_BASE_URL;
    if (!base) return undefined;
    return `${base.replace(/\/$/, '')}/webhooks/twilio/${path}`;
  }
}

function parseType(value: string): 'mobile' | 'local' | 'tollfree' | undefined {
  if (value === 'mobile' || value === 'local' || value === 'tollfree') return value;
  return undefined;
}

function toCapabilitiesEntry(c: PhoneCapabilities): PhoneCapabilitiesEntry {
  return { sms: c.sms, mms: c.mms, voice: c.voice };
}

function toAvailableEntry(n: AvailableNumber): AvailablePhoneNumberEntry {
  return {
    phoneE164: n.phoneE164,
    capabilities: toCapabilitiesEntry(n.capabilities),
    region: n.region ?? '',
    locality: n.locality ?? '',
  };
}

function stringifyError(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}
