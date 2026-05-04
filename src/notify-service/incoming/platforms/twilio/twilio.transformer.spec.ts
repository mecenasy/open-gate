import { Platform } from '../../../types/platform';
import { Type } from '../../../types/unified-message';
import { TwilioTransformer } from './twilio.transformer';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

function makePayload(over: Partial<TwilioSmsWebhookPayloadWithMedia> = {}): TwilioSmsWebhookPayloadWithMedia {
  return {
    MessageSid: 'SM123',
    From: '+48111222333',
    To: '+48999888777',
    Body: 'hello',
    NumMedia: '0',
    AccountSid: 'AC1',
    NumSegments: '1',
    ...over,
  } as TwilioSmsWebhookPayloadWithMedia;
}

describe('TwilioTransformer', () => {
  const transformer = new TwilioTransformer();

  it('exposes Platform.Sms', () => {
    expect(transformer.platform).toBe(Platform.Sms);
  });

  it('maps a plain SMS to a text UnifiedMessage keyed by sender E.164', async () => {
    const out = await transformer.transform(makePayload({ Body: 'hi there' }));

    expect(out).toMatchObject({
      platform: Platform.Sms,
      chatId: '+48111222333',
      authorId: '+48111222333',
      messageId: 'SM123',
      content: 'hi there',
      type: Type.Text,
      media: undefined,
    });
    expect(out.raw.MessageSid).toBe('SM123');
  });

  it('coerces missing Body to empty string', async () => {
    const out = await transformer.transform(makePayload({ Body: undefined }));
    expect(out.content).toBe('');
  });

  it('extracts MediaUrl0 / MediaContentType0 when NumMedia > 0', async () => {
    const out = await transformer.transform(
      makePayload({
        NumMedia: '1',
        MediaUrl0: 'https://twilio/media/abc',
        MediaContentType0: 'image/png',
      }),
    );
    expect(out.media).toEqual({ url: 'https://twilio/media/abc', contentType: 'image/png' });
    expect(out.type).toBe(Type.Image);
  });

  it('falls back to octet-stream when MediaContentType0 is missing', async () => {
    const out = await transformer.transform(makePayload({ NumMedia: '1', MediaUrl0: 'https://twilio/media/abc' }));
    expect(out.media?.contentType).toBe('application/octet-stream');
  });

  it('treats NumMedia="0" or absent as no media', async () => {
    expect((await transformer.transform(makePayload({ NumMedia: '0' }))).media).toBeUndefined();
    expect((await transformer.transform(makePayload({ NumMedia: undefined }))).media).toBeUndefined();
  });
});
