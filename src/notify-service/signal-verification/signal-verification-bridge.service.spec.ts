import type { CacheService } from '@app/redis';
import { SignalVerificationBridgeService } from './signal-verification-bridge.service';

describe('SignalVerificationBridgeService', () => {
  let cache: jest.Mocked<CacheService>;
  let svc: SignalVerificationBridgeService;

  beforeEach(() => {
    cache = {
      saveInCache: jest.fn().mockResolvedValue(undefined),
      removeFromCache: jest.fn().mockResolvedValue(undefined),
      checkExistsInCache: jest.fn(),
      getFromCache: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;
    svc = new SignalVerificationBridgeService(cache);
    jest.spyOn((svc as unknown as { logger: { log: jest.Mock } }).logger, 'log').mockImplementation(() => undefined);
  });

  describe('markPending / clearPending / isPending', () => {
    it('markPending stores under pending prefix with 10 min TTL', async () => {
      await svc.markPending('+48111');
      expect(cache.saveInCache).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: '+48111',
          prefix: 'signal-verification-pending',
          EX: 10 * 60,
          data: expect.objectContaining({ since: expect.any(String) }),
        }),
      );
    });

    it('clearPending drops both pending and code keys (idempotent)', async () => {
      await svc.clearPending('+48111');
      expect(cache.removeFromCache).toHaveBeenCalledWith({
        identifier: '+48111',
        prefix: 'signal-verification-pending',
      });
      expect(cache.removeFromCache).toHaveBeenCalledWith({
        identifier: '+48111',
        prefix: 'signal-verification-code',
      });
    });

    it('isPending delegates to checkExistsInCache', async () => {
      cache.checkExistsInCache.mockResolvedValue(true);
      expect(await svc.isPending('+48111')).toBe(true);
    });
  });

  describe('recordCode / getCode', () => {
    it('recordCode stores code+source+timestamp with 10 min TTL', async () => {
      await svc.recordCode('+48111', '123456', 'signal');

      expect(cache.saveInCache).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: '+48111',
          prefix: 'signal-verification-code',
          EX: 10 * 60,
          data: expect.objectContaining({ code: '123456', source: 'signal', receivedAt: expect.any(String) }),
        }),
      );
    });

    it('getCode reads from code prefix', async () => {
      cache.getFromCache.mockResolvedValue({ code: '654321', source: 'signal', receivedAt: 'iso' });
      const out = await svc.getCode('+48111');
      expect(out?.code).toBe('654321');
      expect(cache.getFromCache).toHaveBeenCalledWith({ identifier: '+48111', prefix: 'signal-verification-code' });
    });

    it('getCode returns null when redis has nothing', async () => {
      cache.getFromCache.mockResolvedValue(null);
      expect(await svc.getCode('+48111')).toBeNull();
    });
  });

  describe('extractCode', () => {
    it('extracts a Signal 6-digit code (with dash)', () => {
      expect(svc.extractCode('Your Signal verification code: 123-456')).toEqual({
        code: '123456',
        source: 'signal',
      });
    });

    it('extracts a Signal 6-digit code (no dash)', () => {
      expect(svc.extractCode('Signal code 987654')).toEqual({ code: '987654', source: 'signal' });
    });

    it('extracts a WhatsApp code', () => {
      expect(svc.extractCode('Your WhatsApp code is 111-222')).toEqual({ code: '111222', source: 'whatsapp' });
      expect(svc.extractCode('WhatsApp Web verification 999000')).toEqual({ code: '999000', source: 'whatsapp' });
    });

    it('extracts a Messenger code with FB- prefix', () => {
      expect(svc.extractCode('Use FB-12345 for Messenger')).toEqual({ code: '12345', source: 'messenger' });
    });

    it('extracts a Messenger 6-digit fallback code', () => {
      // Both keyword and 6-digit pattern present.
      expect(svc.extractCode('Facebook code: 333-444')).toEqual({ code: '333444', source: 'messenger' });
    });

    it('returns null when keyword present but no digits found', () => {
      expect(svc.extractCode('We see Signal mentioned but no code')).toBeNull();
    });

    it('returns null when no platform keyword present', () => {
      expect(svc.extractCode('Some random message 123-456')).toBeNull();
    });

    it('prefers Signal over WhatsApp when only Signal keyword matches', () => {
      const out = svc.extractCode('Signal code 123-456');
      expect(out?.source).toBe('signal');
    });
  });
});
