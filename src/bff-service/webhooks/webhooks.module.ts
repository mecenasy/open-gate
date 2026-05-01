import { Module } from '@nestjs/common';
import { TwilioWebhookProxyController } from './twilio/twilio-webhook-proxy.controller';

/**
 * Inbound webhook surface for third-party providers. Currently only Twilio
 * (SMS/voice) — proxies to notify-service via gRPC so the public network
 * keeps a single, throttled, audited entry point and notify-service stays
 * unreachable from the internet.
 *
 * Each new provider gets its own controller under `./<provider>/`; module
 * stays thin (it's just routing surface), with the actual processing
 * implemented in the destination service.
 */
@Module({
  controllers: [TwilioWebhookProxyController],
})
export class WebhooksModule {}
