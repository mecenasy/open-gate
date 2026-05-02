import { Injectable, Logger } from '@nestjs/common';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import { DEFAULT_PLATFORM_FALLBACK_ID, PlatformConfigService } from '../../../platform-config/platform-config.service';
import { WebhookHandler, type WebhookRequest, type WebhookResponse } from '../../webhook/webhook.handler';
import { TwilioBridgeService } from './twilio-bridge.service';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

const VOICE_HANGUP_TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="pl-PL">Ten numer obsługuje tylko wiadomości SMS. Skontaktuj się przez SMS.</Say>
  <Hangup/>
</Response>`;

/**
 * Twilio webhook receiver. Validates X-Twilio-Signature against the
 * master auth token, then dispatches by sub-path:
 *   - 'sms'   → bridge (verification short-circuit + tenant routing → MessageEvent)
 *   - 'voice' → polite-hangup TwiML (numbers are SMS-only by policy)
 *
 * SMS bridge errors still return 200 — they're logged for investigation;
 * Twilio retrying a likely-broken payload just fills the queue.
 */
@Injectable()
export class TwilioWebhookHandler extends WebhookHandler {
  readonly provider = 'twilio';
  private readonly logger = new Logger(TwilioWebhookHandler.name);

  constructor(
    private readonly bridge: TwilioBridgeService,
    private readonly platformConfig: PlatformConfigService,
  ) {
    super();
  }

  async handle(request: WebhookRequest): Promise<WebhookResponse> {
    const signature = request.headers?.['x-twilio-signature'];
    if (!signature) {
      this.logger.warn('Twilio webhook missing X-Twilio-Signature; dropping.');
      return reject(403, 'Missing X-Twilio-Signature header.');
    }

    const master = await this.platformConfig.getConfig(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
    if (!master?.token) {
      this.logger.error('Twilio webhook rejected: master auth token unavailable.');
      return reject(503, 'Master auth token unavailable.');
    }

    const formFields = request.formFields ?? {};
    const valid = validateRequest(master.token, signature, request.fullUrl, formFields);
    if (!valid) {
      this.logger.warn(`Twilio webhook rejected: signature mismatch (url=${request.fullUrl}).`);
      return reject(403, 'Signature mismatch.');
    }

    if (request.path === 'voice') {
      return { statusCode: 200, contentType: 'text/xml; charset=utf-8', body: VOICE_HANGUP_TWIML };
    }
    if (request.path !== 'sms') {
      this.logger.warn(`Unknown Twilio webhook path '${request.path}'.`);
      return reject(404, `Unknown webhook path '${request.path}'.`);
    }

    try {
      await this.bridge.handleInboundSms(formFields as TwilioSmsWebhookPayloadWithMedia);
      return { statusCode: 200, contentType: 'text/plain; charset=utf-8', body: '' };
    } catch (err) {
      this.logger.error(`Twilio SMS bridge failed: ${stringifyError(err)}`);
      // Still 200 — message logged; we'd rather investigate than re-process.
      return { statusCode: 200, contentType: 'text/plain; charset=utf-8', body: '' };
    }
  }
}

function reject(statusCode: number, body: string): WebhookResponse {
  return { statusCode, contentType: 'text/plain; charset=utf-8', body };
}

function stringifyError(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}
