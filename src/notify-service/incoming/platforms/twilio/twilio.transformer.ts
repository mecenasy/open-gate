import { Injectable } from '@nestjs/common';
import { Platform } from '../../../types/platform';
import { Type, type UnifiedMessage } from '../../../types/unified-message';
import { Transform } from '../transformer';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

/**
 * Maps a Twilio inbound SMS webhook payload to the platform-neutral
 * UnifiedMessage shape consumed by the existing message bridge handler.
 *
 *   - chatId   = sender's E.164 (so the conversation thread is keyed by
 *                the contact, matching how every other platform does it).
 *   - authorId = sender's E.164 too — Twilio webhooks don't expose a
 *                separate account-side identifier and we don't need one.
 *   - media    = first MediaUrl{0} when present (attachment bridge handler
 *                ignores secondary media in current impl; revisit when
 *                multi-attachment support lands).
 */
@Injectable()
export class TwilioTransformer extends Transform {
  platform = Platform.Sms;

  transform(data: TwilioSmsWebhookPayloadWithMedia): Promise<UnifiedMessage<TwilioSmsWebhookPayloadWithMedia>> {
    // ctx (tenantId) is unused — Twilio webhooks already carry the
    // sender's E.164 in the From field, no platform-side translation needed.
    const numMedia = parseInt(data.NumMedia ?? '0', 10);
    const firstMediaUrl = numMedia > 0 ? data.MediaUrl0 : undefined;
    const firstMediaType = numMedia > 0 ? data.MediaContentType0 : undefined;

    const media = firstMediaUrl
      ? {
          url: firstMediaUrl,
          contentType: firstMediaType ?? 'application/octet-stream',
        }
      : undefined;

    const message: UnifiedMessage<TwilioSmsWebhookPayloadWithMedia> = {
      platform: this.platform,
      chatId: data.From,
      authorId: data.From,
      messageId: data.MessageSid,
      content: data.Body ?? '',
      raw: data,
      media,
      type: media ? Type.Image : Type.Text,
    };

    return Promise.resolve(message);
  }
}
