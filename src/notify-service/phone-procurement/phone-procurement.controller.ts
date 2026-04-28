import { Controller, Logger } from '@nestjs/common';
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
} from 'src/proto/phone-procurement';
import { PhoneProcurementService } from './phone-procurement.service';
import { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import { SignalVerificationBridgeService } from '../signal-verification/signal-verification-bridge.service';
import type { AvailableNumber, PhoneCapabilities } from './phone-procurement.types';

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
