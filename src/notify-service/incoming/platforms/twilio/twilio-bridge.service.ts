import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../../types/platform';
import { MessageEvent } from '../../event/message.event';
import { SignalVerificationBridgeService } from '../../../signal-verification/signal-verification-bridge.service';
import { TwilioTenantLookupService } from './twilio-tenant-lookup.service';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

/**
 * Orchestrates an inbound Twilio webhook in two passes:
 *
 *   1. Verification short-circuit: if Signal onboarding has flagged the
 *      receiving number as mid-verification (keyed on E.164, so wizard
 *      flow works before a tenant exists), pull the 6-digit code out of
 *      the body and stash it in Redis. The frontend polls a BFF query
 *      and auto-fills the verify step. The SMS does NOT also surface in
 *      the conversation feed.
 *
 *   2. Regular routing: look up which tenant owns the receiving number
 *      and emit a MessageEvent for the standard inbound pipeline. When
 *      no tenant matches we report success anyway — retries on a number
 *      we don't recognise just waste Twilio's queue.
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
    if (await this.verificationBridge.isPending(payload.To)) {
      const code = this.verificationBridge.extractCode(payload.Body ?? '');
      if (code) {
        await this.verificationBridge.recordCode(payload.To, code);
        // Don't re-emit as a MessageEvent — the verification SMS isn't a
        // user-facing chat message, and double-routing it would surface
        // in the conversation feed.
        return;
      }
    }

    const tenantId = await this.tenantLookup.lookupTenantByPhoneNumber(payload.To);
    if (!tenantId) {
      this.logger.warn(
        `No tenant owns ${payload.To} — dropping inbound SMS ${payload.MessageSid} from ${payload.From}.`,
      );
      return;
    }

    await this.eventBus.publish(new MessageEvent(payload, Platform.Sms, tenantId));
  }
}
