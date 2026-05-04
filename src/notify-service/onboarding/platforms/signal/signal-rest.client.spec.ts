import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders } from 'axios';
import type { HttpService } from '@nestjs/axios';
import { SignalRestClient } from './signal-rest.client';

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('failed');
  err.response = {
    status,
    statusText: 'X',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosError['response'];
  err.config = { headers: new AxiosHeaders() } as AxiosError['config'];
  return err;
}

describe('SignalRestClient', () => {
  let http: jest.Mocked<HttpService>;
  let client: SignalRestClient;

  beforeEach(() => {
    http = { get: jest.fn(), post: jest.fn() } as unknown as jest.Mocked<HttpService>;
    client = new SignalRestClient(http);
    jest
      .spyOn((client as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  describe('healthCheck', () => {
    it('returns true on a 2xx', async () => {
      http.get.mockReturnValue(of({ status: 200, data: {} }) as never);
      expect(await client.healthCheck('http://signal:8080/')).toBe(true);
      expect(http.get).toHaveBeenCalledWith('http://signal:8080/v1/about', expect.objectContaining({ timeout: 3000 }));
    });

    it('returns false on axios failure', async () => {
      http.get.mockReturnValue(throwError(() => new Error('ECONNREFUSED')) as never);
      expect(await client.healthCheck('http://signal:8080')).toBe(false);
    });

    it('strips trailing slashes from base URL', async () => {
      http.get.mockReturnValue(of({ status: 200, data: {} }) as never);
      await client.healthCheck('http://signal:8080///');
      expect(http.get).toHaveBeenCalledWith('http://signal:8080/v1/about', expect.any(Object));
    });
  });

  describe('getQrCodeLink', () => {
    it('returns base64-encoded PNG payload', async () => {
      const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer;
      http.get.mockReturnValue(of({ data: bytes } as never));

      const res = await client.getQrCodeLink('http://signal:8080', 'open-gate');
      expect(res.pngBase64).toBe(Buffer.from(bytes).toString('base64'));
      expect(http.get).toHaveBeenCalledWith(
        'http://signal:8080/v1/qrcodelink',
        expect.objectContaining({
          params: { device_name: 'open-gate', qrcode_version: 11 },
          responseType: 'arraybuffer',
        }),
      );
    });
  });

  describe('register', () => {
    it('returns ok:true on success', async () => {
      http.post.mockReturnValue(of({ data: {} }) as never);
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      expect(res).toEqual({ ok: true });
      expect(http.post).toHaveBeenCalledWith(
        'http://signal:8080/v1/register/%2B48111',
        { use_voice: false },
        expect.objectContaining({ timeout: 15000 }),
      );
    });

    it('classifies 402 as captcha_required', async () => {
      http.post.mockReturnValue(throwError(() => makeAxiosError(402, 'Captcha required')) as never);
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.kind).toBe('captcha_required');
    });

    it('classifies any "captcha" body as captcha_required regardless of status', async () => {
      http.post.mockReturnValue(
        throwError(() => makeAxiosError(400, { error: 'You need a captcha to proceed' })) as never,
      );
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      if (!res.ok) expect(res.error.kind).toBe('captcha_required');
    });

    it('classifies 429 as rate_limited', async () => {
      http.post.mockReturnValue(throwError(() => makeAxiosError(429, 'Too many')) as never);
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      if (!res.ok) expect(res.error.kind).toBe('rate_limited');
    });

    it('classifies 400 with "number" message as invalid_number', async () => {
      http.post.mockReturnValue(throwError(() => makeAxiosError(400, { error: 'Bad number format' })) as never);
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      if (!res.ok) expect(res.error.kind).toBe('invalid_number');
    });

    it('classifies anything else as "other"', async () => {
      http.post.mockReturnValue(throwError(() => makeAxiosError(500, { error: 'internal' })) as never);
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      if (!res.ok) expect(res.error.kind).toBe('other');
    });

    it('classifies non-axios errors as "other"', async () => {
      http.post.mockReturnValue(throwError(() => new Error('weird')) as never);
      const res = await client.register('http://signal:8080', '+48111', { use_voice: false });
      if (!res.ok) {
        expect(res.error.kind).toBe('other');
        expect(res.error.message).toBe('weird');
      }
    });
  });

  describe('verify', () => {
    it('strips dashes via caller and posts pin payload when provided', async () => {
      http.post.mockReturnValue(of({ data: {} }) as never);

      const res = await client.verify('http://signal:8080', '+48111', '123456', '0000');
      expect(res).toEqual({ ok: true });
      expect(http.post).toHaveBeenCalledWith(
        'http://signal:8080/v1/register/%2B48111/verify/123456',
        { pin: '0000' },
        expect.any(Object),
      );
    });

    it('posts empty body when pin is omitted', async () => {
      http.post.mockReturnValue(of({ data: {} }) as never);

      await client.verify('http://signal:8080', '+48111', '123456');
      expect(http.post).toHaveBeenCalledWith(
        'http://signal:8080/v1/register/%2B48111/verify/123456',
        {},
        expect.any(Object),
      );
    });

    it('returns ok:false with describe(error) on rejection', async () => {
      http.post.mockReturnValue(throwError(() => makeAxiosError(403, 'Bad code')) as never);
      const res = await client.verify('http://signal:8080', '+48111', '123456');
      expect(res.ok).toBe(false);
      expect(res.message).toContain('Bad code');
    });
  });

  describe('unregister', () => {
    it('returns ok:true on success', async () => {
      http.post.mockReturnValue(of({ data: {} }) as never);
      const res = await client.unregister('http://signal:8080', '+48111');
      expect(res).toEqual({ ok: true });
      expect(http.post).toHaveBeenCalledWith('http://signal:8080/v1/unregister/%2B48111', {}, expect.any(Object));
    });

    it('returns ok:false with describe(error) on rejection', async () => {
      http.post.mockReturnValue(throwError(() => new Error('boom')) as never);
      const res = await client.unregister('http://signal:8080', '+48111');
      expect(res.ok).toBe(false);
      expect(res.message).toContain('boom');
    });
  });

  describe('listAccounts', () => {
    it('returns the array on success', async () => {
      http.get.mockReturnValue(of({ data: ['+48111', '+48222'] }) as never);
      expect(await client.listAccounts('http://signal:8080')).toEqual(['+48111', '+48222']);
    });

    it('returns [] when payload is not an array', async () => {
      http.get.mockReturnValue(of({ data: { accounts: ['+48111'] } as unknown as string[] }) as never);
      expect(await client.listAccounts('http://signal:8080')).toEqual([]);
    });

    it('returns [] and logs on error', async () => {
      http.get.mockReturnValue(throwError(() => new Error('flap')) as never);
      expect(await client.listAccounts('http://signal:8080')).toEqual([]);
    });
  });
});
