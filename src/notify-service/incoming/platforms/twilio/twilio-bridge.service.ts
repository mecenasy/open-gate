import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../../types/platform';
import { MessageEvent } from '../../event/message.event';
import { SignalVerificationBridgeService } from '../../../signal-verification/signal-verification-bridge.service';
import { TwilioTenantLookupService } from './twilio-tenant-lookup.service';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

/**
 * Orchestrates an inbound Twilio webhook: find the tenant that owns the
 * receiving number, then either route the SMS to the Signal verification
 * bridge (if that tenant is mid-Signal-onboarding and the body carries a
 * 6-digit code) or emit a MessageEvent so the existing MessageBridgeHandler
 * picks it up via the shared transformer registry.
 *
 * Returning silently when no tenant matches is intentional — Twilio
 * retries non-2xx responses, and a number we don't recognise is *our*
 * problem, not theirs. The lookup service logs the miss.
 */
@Injectable()
export class TwilioBridgeService {
  private readonly logger = new Logger(TwilioBridgeService.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly tenantLookup: TwilioTenantLookupService,
    private readonly verificationBridge: SignalVerificationBridgeService,
  ) {}

  async handleInboundSms(payload: TwilioSmsWebhookPayloadWithMedia): Promise<void> {
    const tenantId = await this.tenantLookup.lookupTenantByPhoneNumber(payload.To);
    if (!tenantId) {
      this.logger.warn(
        `No tenant owns ${payload.To} — dropping inbound SMS ${payload.MessageSid} from ${payload.From}.`,
      );
      return;
    }

    if (await this.verificationBridge.isPending(tenantId)) {
      const code = this.verificationBridge.extractCode(payload.Body ?? '');
      if (code) {
        await this.verificationBridge.recordCode(tenantId, code);
        // Don't re-emit as a MessageEvent — the verification SMS isn't a
        // user-facing chat message, and double-routing it would surface in
        // the conversation feed.
        return;
      }
    }

    await this.eventBus.publish(new MessageEvent(payload, Platform.Sms, tenantId));
  }
}
