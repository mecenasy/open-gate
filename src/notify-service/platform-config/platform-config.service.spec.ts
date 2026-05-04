import { of, throwError } from 'rxjs';
import type { ConfigService } from '@nestjs/config';
import type { ClientGrpc } from '@nestjs/microservices';
import type { CacheService } from '@app/redis';
import type { TenantServiceClient } from 'src/proto/tenant';
import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  PlatformConfigService,
  type SmsCredentials,
  type SignalCredentials,
} from './platform-config.service';

describe('PlatformConfigService', () => {
  let cache: jest.Mocked<CacheService>;
  let cfg: jest.Mocked<ConfigService>;
  let grpc: jest.Mocked<ClientGrpc>;
  let tenantSvc: jest.Mocked<TenantServiceClient>;
  let svc: PlatformConfigService;

  beforeEach(() => {
    cache = {
      getFromCache: jest.fn(),
      saveInCache: jest.fn().mockResolvedValue(undefined),
      removeFromCache: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CacheService>;

    cfg = { get: jest.fn() } as unknown as jest.Mocked<ConfigService>;

    tenantSvc = {
      getPlatformCredentials: jest.fn(),
      getTenantsWithPlatform: jest.fn(),
    } as unknown as jest.Mocked<TenantServiceClient>;

    grpc = { getService: jest.fn().mockReturnValue(tenantSvc) } as unknown as jest.Mocked<ClientGrpc>;

    svc = new PlatformConfigService(grpc, cache, cfg);
    svc.onModuleInit();

    jest.spyOn((svc as unknown as { logger: { warn: jest.Mock } }).logger, 'warn').mockImplementation(() => undefined);
  });

  describe('getConfig', () => {
    it('returns cached value without hitting gRPC', async () => {
      cache.getFromCache.mockResolvedValue({ apiUrl: 'cached', account: '+1' } as SignalCredentials);

      const out = await svc.getConfig('t-1', 'signal');
      expect(out).toEqual({ apiUrl: 'cached', account: '+1' });
      expect(tenantSvc.getPlatformCredentials).not.toHaveBeenCalled();
    });

    it('fetches via gRPC, caches with 30 min TTL on miss', async () => {
      cache.getFromCache.mockResolvedValue(null);
      tenantSvc.getPlatformCredentials.mockReturnValue(
        of({ status: true, configJson: JSON.stringify({ apiUrl: 'http://signal:8080', account: '+1' }) } as never),
      );

      const out = await svc.getConfig('t-1', 'signal');
      expect(out).toEqual({ apiUrl: 'http://signal:8080', account: '+1' });
      expect(tenantSvc.getPlatformCredentials).toHaveBeenCalledWith({ tenantId: 't-1', platform: 'signal' });
      expect(cache.saveInCache).toHaveBeenCalledWith(
        expect.objectContaining({ EX: 30 * 60, identifier: 'platform:signal:t-1' }),
      );
    });

    it('falls back to env when redis errors AND gRPC also returns no row', async () => {
      cache.getFromCache.mockRejectedValue(new Error('redis flap'));
      tenantSvc.getPlatformCredentials.mockReturnValue(of({ status: false, configJson: '' } as never));
      cfg.get.mockReturnValue({ apiUrl: 'env-url', account: 'env-acc' });

      const out = await svc.getConfig('t-1', 'signal');
      expect(out).toEqual({ apiUrl: 'env-url', account: 'env-acc' });
    });

    it('falls back to env when gRPC throws', async () => {
      cache.getFromCache.mockResolvedValue(null);
      tenantSvc.getPlatformCredentials.mockReturnValue(throwError(() => new Error('grpc down')) as never);
      cfg.get.mockReturnValue({ apiUrl: 'env-url', account: 'env-acc' });

      const out = await svc.getConfig('t-1', 'signal');
      expect(out).toEqual({ apiUrl: 'env-url', account: 'env-acc' });
    });

    it('returns null when no config anywhere', async () => {
      cache.getFromCache.mockResolvedValue(null);
      tenantSvc.getPlatformCredentials.mockReturnValue(of({ status: false, configJson: '' } as never));
      cfg.get.mockReturnValue(undefined);

      expect(await svc.getConfig('t-1', 'signal')).toBeNull();
    });
  });

  describe('getTenantsWithPlatform', () => {
    it('returns parsed entries on success', async () => {
      tenantSvc.getTenantsWithPlatform.mockReturnValue(
        of({
          status: true,
          entries: [
            { tenantId: 't-1', configJson: JSON.stringify({ apiUrl: 'a', account: '+1' }) },
            { tenantId: 't-2', configJson: JSON.stringify({ apiUrl: 'b', account: '+2' }) },
          ],
        } as never),
      );

      const out = await svc.getTenantsWithPlatform('signal');
      expect(out).toHaveLength(2);
      expect(out[0]).toEqual({ tenantId: 't-1', config: { apiUrl: 'a', account: '+1' } });
    });

    it('skips entries whose configJson is malformed', async () => {
      tenantSvc.getTenantsWithPlatform.mockReturnValue(
        of({
          status: true,
          entries: [
            { tenantId: 't-good', configJson: '{"apiUrl":"a","account":"+1"}' },
            { tenantId: 't-bad', configJson: 'not-json' },
          ],
        } as never),
      );

      const out = await svc.getTenantsWithPlatform('signal');
      expect(out).toHaveLength(1);
      expect(out[0].tenantId).toBe('t-good');
    });

    it('returns [] when status=false', async () => {
      tenantSvc.getTenantsWithPlatform.mockReturnValue(of({ status: false, entries: [] } as never));
      expect(await svc.getTenantsWithPlatform('signal')).toEqual([]);
    });

    it('returns [] and logs on rpc error', async () => {
      tenantSvc.getTenantsWithPlatform.mockReturnValue(throwError(() => new Error('grpc down')) as never);
      expect(await svc.getTenantsWithPlatform('signal')).toEqual([]);
    });

    it('handles missing entries field as []', async () => {
      tenantSvc.getTenantsWithPlatform.mockReturnValue(of({ status: true, entries: undefined } as never));
      expect(await svc.getTenantsWithPlatform('signal')).toEqual([]);
    });
  });

  describe('resolveSmsCredentials', () => {
    it('returns null when no SMS config exists', async () => {
      cache.getFromCache.mockResolvedValue(null);
      tenantSvc.getPlatformCredentials.mockReturnValue(of({ status: false, configJson: '' } as never));
      cfg.get.mockReturnValue(undefined);

      expect(await svc.resolveSmsCredentials('t-1')).toBeNull();
    });

    it('treats master row marked provider=managed as misconfigured (returns null)', async () => {
      cache.getFromCache.mockResolvedValue({ provider: 'managed', phone: '+1' } as SmsCredentials);

      expect(await svc.resolveSmsCredentials(DEFAULT_PLATFORM_FALLBACK_ID)).toBeNull();
    });

    it('returns null when managed tenant lacks master row sid/token', async () => {
      cache.getFromCache
        .mockResolvedValueOnce({ provider: 'managed', phone: '+48999' } as SmsCredentials) // tenant
        .mockResolvedValueOnce({ provider: 'twilio', sid: '', token: '', phone: '' } as SmsCredentials); // master

      expect(await svc.resolveSmsCredentials('t-1')).toBeNull();
    });

    it('returns null when managed tenant has no phone', async () => {
      cache.getFromCache
        .mockResolvedValueOnce({ provider: 'managed', phone: '' } as SmsCredentials)
        .mockResolvedValueOnce({ provider: 'twilio', sid: 'AC', token: 't', phone: '' } as SmsCredentials);

      expect(await svc.resolveSmsCredentials('t-1')).toBeNull();
    });

    it('merges managed tenant phone with master sid/token', async () => {
      cache.getFromCache
        .mockResolvedValueOnce({ provider: 'managed', phone: '+48999' } as SmsCredentials)
        .mockResolvedValueOnce({
          provider: 'twilio',
          sid: 'AC',
          token: 't',
          phone: '',
          bundleSidByCountry: { PL: 'BU' },
          addressSidByCountry: { PL: 'AD' },
        } as SmsCredentials);

      const out = await svc.resolveSmsCredentials('t-1');
      expect(out).toEqual({
        provider: 'managed',
        sid: 'AC',
        token: 't',
        phone: '+48999',
        bundleSidByCountry: { PL: 'BU' },
        addressSidByCountry: { PL: 'AD' },
      });
    });

    it('returns null for self-hosted with missing fields', async () => {
      cache.getFromCache.mockResolvedValueOnce({
        provider: 'twilio',
        sid: '',
        token: 't',
        phone: '+1',
      } as SmsCredentials);
      expect(await svc.resolveSmsCredentials('t-1')).toBeNull();
    });

    it('returns self-hosted credentials when complete', async () => {
      cache.getFromCache.mockResolvedValueOnce({
        provider: 'twilio',
        sid: 'AC',
        token: 't',
        phone: '+1',
      } as SmsCredentials);

      const out = await svc.resolveSmsCredentials('t-1');
      expect(out).toEqual({ provider: 'twilio', sid: 'AC', token: 't', phone: '+1' });
    });

    it('treats undefined provider as self-hosted "twilio"', async () => {
      cache.getFromCache.mockResolvedValueOnce({ sid: 'AC', token: 't', phone: '+1' } as SmsCredentials);

      const out = await svc.resolveSmsCredentials('t-1');
      expect(out?.provider).toBe('twilio');
    });
  });

  describe('invalidate', () => {
    it('removes the cached entry for a tenant/platform', () => {
      svc.invalidate('t-1', 'signal');
      expect(cache.removeFromCache).toHaveBeenCalledWith({
        identifier: 'platform:signal:t-1',
        prefix: 'platform-config',
      });
    });
  });

  describe('envFallback', () => {
    it('returns signal config when env has it', () => {
      cfg.get.mockReturnValue({ apiUrl: 'http://env:8080', account: '+1' });
      expect(svc.envFallback('signal')).toEqual({ apiUrl: 'http://env:8080', account: '+1' });
    });

    it('returns sms config when env has it', () => {
      cfg.get.mockReturnValue({ sid: 'AC', token: 't', phone: '+1' });
      expect(svc.envFallback('sms')).toEqual({ sid: 'AC', token: 't', phone: '+1' });
    });

    it('defaults SMTP port to 465 when missing', () => {
      cfg.get.mockReturnValue({ host: 'smtp', user: 'u', password: 'p', from: 'f' });
      const out = svc.envFallback('smtp');
      expect(out).toMatchObject({ port: 465, host: 'smtp' });
    });

    it('returns null for unknown platforms', () => {
      expect(svc.envFallback('whatsapp')).toBeNull();
    });

    it('returns null when smtp env is missing', () => {
      cfg.get.mockReturnValue(undefined);
      expect(svc.envFallback('smtp')).toBeNull();
    });
  });
});
