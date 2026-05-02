import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../../types/platform';
import { MessageEvent } from '../../event/message.event';
import { SignalVerificationBridgeService } from '../../../signal-verification/signal-verification-bridge.service';
import { VerificationForwarderService } from '../../../signal-verification/verification-forwarder.service';
import { TwilioTenantLookupService } from './twilio-tenant-lookup.service';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

/**
 * Orchestrates an inbound Twilio webhook in two passes:
 *
 *   1. Verification short-circuit: try to pull a verification code (from
 *      Signal/WhatsApp/Messenger) out of the body. If one is found we
 *      stash it in Redis (10-min TTL bridges the race where the SMS
 *      lands before the front opens its socket) and push it to BFF over
 *      gRPC for real-time delivery to the frontend. We do NOT emit a
 *      MessageEvent — the verification SMS isn't a chat message and
 *      double-routing it would surface in the conversation feed.
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
    private readonly verificationForwarder: VerificationForwarderService,
  ) {}

  async handleInboundSms(payload: TwilioSmsWebhookPayloadWithMedia): Promise<void> {
    const extracted = this.verificationBridge.extractCode(payload.Body ?? '');
    if (extracted) {
      await this.verificationBridge.recordCode(payload.To, extracted.code, extracted.source);
      await this.verificationForwarder.forward(payload.To, extracted.code, extracted.source);
      return;
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
