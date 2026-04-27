import { Body, Controller, Header, HttpCode, Post, UseGuards } from '@nestjs/common';
import { TwilioSignatureGuard } from './twilio-signature.guard';
import { TwilioBridgeService } from './twilio-bridge.service';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

const VOICE_HANGUP_TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="pl-PL">Ten numer obsługuje tylko wiadomości SMS. Skontaktuj się przez SMS.</Say>
  <Hangup/>
</Response>`;

/**
 * Public Twilio webhook surface. Mounted on the notify-service HTTP port
 * (registered as smsUrl/voiceUrl on every purchased number); the signature
 * guard is the only gatekeeper between this controller and the message
 * bridge.
 *
 * The /sms route always returns 200 to Twilio after the bridge call, even
 * when the lookup misses — Twilio retries on non-2xx, and there's no point
 * re-delivering a message bound for a tenant we can't resolve.
 *
 * The /voice route returns TwiML that politely hangs up — voice is not
 * supported in the current managed flow. Per-tenant voice handling lands
 * with the settings phase (configurable greeting, optional voicemail).
 */
@Controller('webhooks/twilio')
@UseGuards(TwilioSignatureGuard)
export class TwilioWebhookController {
  constructor(private readonly bridge: TwilioBridgeService) {}

  @Post('sms')
  @HttpCode(200)
  async sms(@Body() payload: TwilioSmsWebhookPayloadWithMedia): Promise<{ ok: true }> {
    await this.bridge.handleInboundSms(payload);
    return { ok: true };
  }

  @Post('voice')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml; charset=utf-8')
  voice(): string {
    return VOICE_HANGUP_TWIML;
  }
}
