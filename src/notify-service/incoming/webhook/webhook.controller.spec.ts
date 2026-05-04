import { HttpException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { IncomingHttpHeaders } from 'http';
import { WebhookController } from './webhook.controller';
import { WebhookHandler, type WebhookRequest, type WebhookResponse } from './webhook.handler';

class FakeHandler extends WebhookHandler {
  readonly provider = 'twilio';
  handle = jest.fn(
    async (_req: WebhookRequest): Promise<WebhookResponse> => ({
      statusCode: 200,
      contentType: 'text/plain; charset=utf-8',
      body: 'OK',
    }),
  );
}

function makeReq(over: Partial<Request> = {}): Request {
  return {
    headers: { host: 'api.example.com' },
    protocol: 'http',
    originalUrl: '/webhooks/twilio/sms',
    ...over,
  } as Request;
}

function makeRes(): { res: Response; status: jest.Mock; setHeader: jest.Mock } {
  const status = jest.fn().mockReturnThis();
  const setHeader = jest.fn();
  const res = { status, setHeader } as unknown as Response;
  return { res, status, setHeader };
}

describe('WebhookController.handle', () => {
  let configService: jest.Mocked<ConfigService>;
  let handler: FakeHandler;
  let controller: WebhookController;

  beforeEach(() => {
    configService = { get: jest.fn().mockReturnValue(undefined) } as unknown as jest.Mocked<ConfigService>;
    handler = new FakeHandler();
    controller = new WebhookController([handler], configService);
    jest
      .spyOn((controller as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  it('returns 404 body when no handler matches the provider segment', async () => {
    const { res, status, setHeader } = makeRes();
    const out = await controller.handle('unknown', 'sms', {}, makeReq(), res, {});

    expect(status).toHaveBeenCalledWith(404);
    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
    expect(out).toBe('');
    expect(handler.handle).not.toHaveBeenCalled();
  });

  it('forwards normalized request to the matching handler and mirrors its response', async () => {
    const { res, status, setHeader } = makeRes();
    const headers = {
      Host: 'api.example.com',
      'X-Twilio-Signature': ['sig-1', 'sig-2'],
      'X-Forwarded-Proto': 'https',
    } as unknown as IncomingHttpHeaders;

    const out = await controller.handle(
      'twilio',
      'sms',
      headers,
      makeReq({ headers: headers as Request['headers'] }),
      res,
      { MessageSid: 'SM-1', NumMedia: 0, isMms: true, drop: null, blob: { foo: 1 } } as Record<string, unknown>,
    );

    expect(out).toBe('OK');
    expect(status).toHaveBeenCalledWith(200);
    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');

    const passed = handler.handle.mock.calls[0][0];
    expect(passed.provider).toBe('twilio');
    expect(passed.path).toBe('sms');
    expect(passed.headers).toMatchObject({
      host: 'api.example.com',
      'x-twilio-signature': 'sig-1',
      'x-forwarded-proto': 'https',
    });
    expect(passed.formFields).toEqual({
      MessageSid: 'SM-1',
      NumMedia: '0',
      isMms: 'true',
      blob: '{"foo":1}',
    });
  });

  it('uses WEBHOOK_BASE_URL when configured (strips trailing slash)', async () => {
    configService.get = jest.fn().mockReturnValue('https://hooks.example.com/');
    const { res } = makeRes();

    await controller.handle('twilio', 'sms', {}, makeReq({ originalUrl: '/webhooks/twilio/sms' }), res, {});

    expect(handler.handle.mock.calls[0][0].fullUrl).toBe('https://hooks.example.com/webhooks/twilio/sms');
  });

  it('reconstructs URL from forwarded headers when WEBHOOK_BASE_URL is unset', async () => {
    const { res } = makeRes();
    const req = makeReq({
      headers: {
        host: 'localhost',
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'public.example.com',
      } as Request['headers'],
    });

    await controller.handle('twilio', 'sms', req.headers, req, res, {});
    expect(handler.handle.mock.calls[0][0].fullUrl).toBe('https://public.example.com/webhooks/twilio/sms');
  });

  it('falls back to req.protocol/host when no forwarded headers are present', async () => {
    const { res } = makeRes();
    await controller.handle('twilio', 'sms', { host: 'api.example.com' }, makeReq(), res, {});
    expect(handler.handle.mock.calls[0][0].fullUrl).toBe('http://api.example.com/webhooks/twilio/sms');
  });

  it('throws HttpException for 5xx responses (so the global filter logs them)', async () => {
    handler.handle.mockResolvedValue({ statusCode: 503, contentType: 'text/plain', body: 'oops' });
    const { res } = makeRes();

    await expect(controller.handle('twilio', 'sms', {}, makeReq(), res, {})).rejects.toBeInstanceOf(HttpException);
  });

  it('defaults statusCode to 200 and content-type to text/plain when handler returns 0/empty', async () => {
    handler.handle.mockResolvedValue({ statusCode: 0, contentType: '', body: 'fallback' });
    const { res, status, setHeader } = makeRes();

    const out = await controller.handle('twilio', 'sms', {}, makeReq(), res, {});
    expect(out).toBe('fallback');
    expect(status).toHaveBeenCalledWith(200);
    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
  });

  it('skips null/undefined formFields when stringifying body', async () => {
    const { res } = makeRes();

    await controller.handle('twilio', 'sms', {}, makeReq(), res, { a: 'x', b: null, c: undefined } as Record<
      string,
      unknown
    >);

    expect(handler.handle.mock.calls[0][0].formFields).toEqual({ a: 'x' });
  });
});
