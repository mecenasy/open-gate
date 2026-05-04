import type { PlatformConfigService } from '../../../platform-config/platform-config.service';
import { DEFAULT_PLATFORM_FALLBACK_ID } from '../../../platform-config/platform-config.service';
import type { WebhookRequest } from '../../webhook/webhook.handler';
import type { TwilioBridgeService } from './twilio-bridge.service';

jest.mock('twilio/lib/webhooks/webhooks', () => ({
  validateRequest: jest.fn(),
}));

import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import { TwilioWebhookHandler } from './twilio-webhook.handler';

const validateRequestMock = validateRequest as jest.MockedFunction<typeof validateRequest>;

function makeReq(over: Partial<WebhookRequest> = {}): WebhookRequest {
  return {
    provider: 'twilio',
    path: 'sms',
    fullUrl: 'https://example.com/webhooks/twilio/sms',
    headers: { 'x-twilio-signature': 'sig-abc' },
    formFields: { MessageSid: 'SM-1', From: '+1', To: '+2' },
    ...over,
  };
}

describe('TwilioWebhookHandler.handle', () => {
  let bridge: jest.Mocked<TwilioBridgeService>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let handler: TwilioWebhookHandler;

  beforeEach(() => {
    bridge = {
      handleInboundSms: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TwilioBridgeService>;
    cfg = { getConfig: jest.fn() } as unknown as jest.Mocked<PlatformConfigService>;
    handler = new TwilioWebhookHandler(bridge, cfg);
    validateRequestMock.mockReset();
    jest
      .spyOn((handler as unknown as { logger: { warn: jest.Mock; error: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((handler as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  it('exposes provider="twilio"', () => {
    expect(handler.provider).toBe('twilio');
  });

  it('rejects with 403 when X-Twilio-Signature is missing', async () => {
    const res = await handler.handle(makeReq({ headers: {} }));
    expect(res.statusCode).toBe(403);
    expect(res.body).toContain('Missing X-Twilio-Signature');
    expect(cfg.getConfig).not.toHaveBeenCalled();
  });

  it('returns 503 when master auth token is unavailable', async () => {
    cfg.getConfig.mockResolvedValue(null);

    const res = await handler.handle(makeReq());
    expect(res.statusCode).toBe(503);
    expect(cfg.getConfig).toHaveBeenCalledWith(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
    expect(validateRequestMock).not.toHaveBeenCalled();
  });

  it('rejects with 403 when twilio signature validation fails', async () => {
    cfg.getConfig.mockResolvedValue({ token: 'master-token', sid: 'SID', phone: '' } as never);
    validateRequestMock.mockReturnValue(false);

    const res = await handler.handle(makeReq());
    expect(res.statusCode).toBe(403);
    expect(res.body).toContain('Signature mismatch');
    expect(validateRequestMock).toHaveBeenCalledWith(
      'master-token',
      'sig-abc',
      'https://example.com/webhooks/twilio/sms',
      expect.any(Object),
    );
  });

  it('returns TwiML hangup XML for the voice path', async () => {
    cfg.getConfig.mockResolvedValue({ token: 'master-token', sid: 'SID', phone: '' } as never);
    validateRequestMock.mockReturnValue(true);

    const res = await handler.handle(makeReq({ path: 'voice' }));
    expect(res.statusCode).toBe(200);
    expect(res.contentType).toContain('text/xml');
    expect(res.body).toContain('<Hangup');
    expect(bridge.handleInboundSms).not.toHaveBeenCalled();
  });

  it('returns 404 for unknown sub-paths', async () => {
    cfg.getConfig.mockResolvedValue({ token: 'master-token', sid: 'SID', phone: '' } as never);
    validateRequestMock.mockReturnValue(true);

    const res = await handler.handle(makeReq({ path: 'lulu' }));
    expect(res.statusCode).toBe(404);
    expect(res.body).toContain("'lulu'");
  });

  it('routes valid SMS to the bridge and returns 200', async () => {
    cfg.getConfig.mockResolvedValue({ token: 'master-token', sid: 'SID', phone: '' } as never);
    validateRequestMock.mockReturnValue(true);

    const res = await handler.handle(makeReq({ path: 'sms' }));
    expect(res.statusCode).toBe(200);
    expect(bridge.handleInboundSms).toHaveBeenCalledTimes(1);
  });

  it('still returns 200 if the bridge throws — logs the error and avoids Twilio retries', async () => {
    cfg.getConfig.mockResolvedValue({ token: 'master-token', sid: 'SID', phone: '' } as never);
    validateRequestMock.mockReturnValue(true);
    bridge.handleInboundSms.mockRejectedValue(new Error('boom'));

    const res = await handler.handle(makeReq({ path: 'sms' }));
    expect(res.statusCode).toBe(200);
    const errorLog = (handler as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });

  it('handles non-Error rejections from the bridge', async () => {
    cfg.getConfig.mockResolvedValue({ token: 'master-token', sid: 'SID', phone: '' } as never);
    validateRequestMock.mockReturnValue(true);
    bridge.handleInboundSms.mockRejectedValue('string-err');

    const res = await handler.handle(makeReq({ path: 'sms' }));
    expect(res.statusCode).toBe(200);
  });
});
