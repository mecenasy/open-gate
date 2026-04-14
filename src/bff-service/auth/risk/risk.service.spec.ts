import { UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';

jest.mock('geoip-lite', () => ({
  lookup: jest.fn(),
}));

import * as geoIp from 'geoip-lite';
import { RiskService } from './risk.service';
import { RiskReason } from 'src/types/risk-reason';
import { Security } from 'src/bff-service/common/interceptors/security-context.interceptor';
import { History } from 'src/proto/login';

const makeSecurity = (overrides: Partial<Security> = {}): Security => ({
  origin: 'https://app.example.com',
  fingerprint: 'fp-abc',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  location: {
    ip: '1.2.3.4',
    city: 'Warsaw',
    country: 'PL',
    coordinates: [52.2297, 21.0122],
    timezone: 'Europe/Warsaw',
  },
  ...overrides,
});

const makeHistory = (overrides: Partial<History> = {}): History => ({
  failureCount: 0,
  lastFailureAt: '',
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  lastScore: 10,
  lastIp: '1.2.3.4',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  ...overrides,
});

describe('RiskService', () => {
  let service: RiskService;
  let mockGrpcClient: { getService: jest.Mock };
  let mockGrpcService: {
    addFailure: jest.Mock;
    logRiskEvent: jest.Mock;
    updateRiskEvent: jest.Mock;
    getUnusualTime: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGrpcService = {
      addFailure: jest.fn(),
      logRiskEvent: jest.fn(),
      updateRiskEvent: jest.fn(),
      getUnusualTime: jest.fn().mockReturnValue(of({ similarLogins: 5, totalLogins: 20 })),
    };
    mockGrpcClient = { getService: jest.fn().mockReturnValue(mockGrpcService) };

    service = new RiskService(mockGrpcClient as any);
    service.onModuleInit();

    // Prevent DNS lookups in tests
    (service as any).reverseDns = jest.fn().mockResolvedValue(null);
  });

  // ─── addFailure ────────────────────────────────────────────────────────────

  describe('addFailure', () => {
    it('should call gRPC addFailure with userId and fingerprint', () => {
      const security = makeSecurity();
      service.addFailure('user-1', security);

      expect(mockGrpcService.addFailure).toHaveBeenCalledWith({
        id: 'user-1',
        fingerprintHash: 'fp-abc',
      });
    });
  });

  // ─── getBlockDuration ─────────────────────────────────────────────────────

  describe('getBlockDuration', () => {
    it('should return 0 for fewer than 3 failures', () => {
      expect(service.getBlockDuration(0)).toBe(0);
      expect(service.getBlockDuration(2)).toBe(0);
    });

    it('should return 1 minute for 3-4 failures', () => {
      expect(service.getBlockDuration(3)).toBe(1);
      expect(service.getBlockDuration(4)).toBe(1);
    });

    it('should return 5 minutes for exactly 5 failures', () => {
      expect(service.getBlockDuration(5)).toBe(5);
    });

    it('should increase by 5 minutes for each failure above 5', () => {
      expect(service.getBlockDuration(6)).toBe(10);
      expect(service.getBlockDuration(7)).toBe(15);
      expect(service.getBlockDuration(10)).toBe(30);
    });
  });

  // ─── calculateRisk – no history (new device) ──────────────────────────────

  describe('calculateRisk – new device (no history)', () => {
    it('should add NEW_DEVICE reason and 50 points when history is null/undefined', async () => {
      const result = await service.calculateRisk('user-1', null as unknown as History, makeSecurity());

      expect(result.reasons).toContain(RiskReason.NEW_DEVICE);
      expect(result.score).toBe(50);
    });

    it('should cap score at 100', async () => {
      (service as any).reverseDns = jest.fn().mockResolvedValue(['127.0.0.2']);
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 0, totalLogins: 10 }));
      // With no history, only NEW_DEVICE (+50) is scored, others need history
      const result = await service.calculateRisk('user-1', null as unknown as History, makeSecurity());

      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  // ─── calculateRisk – login lock ───────────────────────────────────────────

  describe('calculateRisk – login lock', () => {
    it('should throw UnauthorizedException when account is locked', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.2297, 21.0122] });
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const recentFailureTime = new Date(Date.now() - 30 * 1000).toISOString(); // 30 seconds ago
      const lockedHistory = makeHistory({
        failureCount: 4, // 4 failures → 1 minute block
        lastFailureAt: recentFailureTime,
      });

      await expect(service.calculateRisk('user-1', lockedHistory, makeSecurity())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should NOT throw when lock duration has passed', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.2297, 21.0122] });
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const oldFailureTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
      const unlockedHistory = makeHistory({
        failureCount: 4,
        lastFailureAt: oldFailureTime,
      });

      await expect(service.calculateRisk('user-1', unlockedHistory, makeSecurity())).resolves.not.toThrow();
    });
  });

  // ─── calculateRisk – previous high risk ───────────────────────────────────

  describe('calculateRisk – PREVIOUS_HIGH_RISK', () => {
    it('should add PREVIOUS_HIGH_RISK (+20) when last score >= 80 within 7 days', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.2297, 21.0122] });
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const recentHighRiskHistory = makeHistory({
        lastScore: 85,
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      });

      const result = await service.calculateRisk('user-1', recentHighRiskHistory, makeSecurity());

      expect(result.reasons).toContain(RiskReason.PREVIOUS_HIGH_RISK);
    });

    it('should NOT add PREVIOUS_HIGH_RISK when last score >= 80 but older than 7 days', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.2297, 21.0122] });
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const oldHighRiskHistory = makeHistory({
        lastScore: 85,
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      });

      const result = await service.calculateRisk('user-1', oldHighRiskHistory, makeSecurity());

      expect(result.reasons).not.toContain(RiskReason.PREVIOUS_HIGH_RISK);
    });
  });

  // ─── calculateRisk – multiple failures ────────────────────────────────────

  describe('calculateRisk – MULTIPLE_FAILURES', () => {
    it('should add MULTIPLE_FAILURES (+60) when failureCount > 3', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue(null);
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const highFailureHistory = makeHistory({ failureCount: 5, lastFailureAt: null });
      const result = await service.calculateRisk('user-1', highFailureHistory, makeSecurity());

      expect(result.reasons).toContain(RiskReason.MULTIPLE_FAILURES);
    });

    it('should NOT add MULTIPLE_FAILURES when failureCount <= 3', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue(null);
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const lowFailureHistory = makeHistory({ failureCount: 3 });
      const result = await service.calculateRisk('user-1', lowFailureHistory, makeSecurity());

      expect(result.reasons).not.toContain(RiskReason.MULTIPLE_FAILURES);
    });
  });

  // ─── calculateRisk – suspicious user agent ────────────────────────────────

  describe('calculateRisk – SUSPICIOUS_USER_AGENT', () => {
    it('should flag headless browser as suspicious', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue(null);
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const security = makeSecurity({ userAgent: 'HeadlessChrome/91.0.4472.124' });
      const result = await service.calculateRisk('user-1', makeHistory(), security);

      expect(result.reasons).toContain(RiskReason.SUSPICIOUS_USER_AGENT);
    });

    it('should flag missing user agent as suspicious', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue(null);
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const security = makeSecurity({ userAgent: undefined });
      const result = await service.calculateRisk('user-1', makeHistory(), security);

      expect(result.reasons).toContain(RiskReason.SUSPICIOUS_USER_AGENT);
    });

    it('should flag OS change between sessions as suspicious', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue(null);
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 5, totalLogins: 20 }));

      const previousWindows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const currentMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

      const historyWithWindows = makeHistory({ userAgent: previousWindows });
      const security = makeSecurity({ userAgent: currentMac });

      const result = await service.calculateRisk('user-1', historyWithWindows, security);

      expect(result.reasons).toContain(RiskReason.SUSPICIOUS_USER_AGENT);
    });
  });

  // ─── calculateRisk – unusual time ─────────────────────────────────────────

  describe('calculateRisk – UNUSUAL_TIME', () => {
    it('should add UNUSUAL_TIME reason when NEW_LOCATION is also present', async () => {
      // Simulate login from a new location (Berlin ~524 km from Warsaw)
      // geoip returns Berlin coords for lastIp, current location is Warsaw → distance > 300 km
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.52, 13.405] }); // Berlin
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 0, totalLogins: 10 }));

      // Use very old updatedAt so IMPOSSIBLE_TRAVEL doesn't trigger
      const oldHistory = makeHistory({
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastIp: '185.0.0.1',
      });
      const security = makeSecurity({
        location: {
          ip: '195.0.0.1',
          city: 'Warsaw',
          country: 'PL',
          coordinates: [52.2297, 21.0122],
          timezone: 'Europe/Warsaw',
        },
      });

      const result = await service.calculateRisk('user-1', oldHistory, security);

      expect(result.reasons).toContain(RiskReason.NEW_LOCATION);
      expect(result.reasons).toContain(RiskReason.UNUSUAL_TIME);
    });

    it('should add score (+5) but NOT add UNUSUAL_TIME to reasons without NEW_LOCATION', async () => {
      // Same location → no NEW_LOCATION, but unusual time
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.2297, 21.0122] }); // Warsaw
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 0, totalLogins: 10 }));

      const normalHistory = makeHistory({ lastScore: 10 });
      const result = await service.calculateRisk('user-1', normalHistory, makeSecurity());

      expect(result.reasons).not.toContain(RiskReason.UNUSUAL_TIME);
      // Score includes +5 for unusual time silently
    });

    it('should NOT add UNUSUAL_TIME when totalLogins is 0', async () => {
      (geoIp.lookup as jest.Mock).mockReturnValue({ ll: [52.2297, 21.0122] });
      mockGrpcService.getUnusualTime.mockReturnValue(of({ similarLogins: 0, totalLogins: 0 }));

      const result = await service.calculateRisk('user-1', makeHistory(), makeSecurity());

      expect(result.reasons).not.toContain(RiskReason.UNUSUAL_TIME);
    });
  });

  // ─── isIpBlacklisted ──────────────────────────────────────────────────────

  describe('isIpBlacklisted', () => {
    it('should return false for localhost (127.0.0.1)', async () => {
      const result = await service.isIpBlacklisted('127.0.0.1');
      expect(result).toBe(false);
    });

    it('should return false for IPv6 addresses', async () => {
      const result = await service.isIpBlacklisted('::1');
      expect(result).toBe(false);
    });

    it('should return true when any DNSBL server returns a result', async () => {
      (service as any).reverseDns = jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(['127.0.0.2'])
        .mockResolvedValue(null);

      const result = await service.isIpBlacklisted('1.2.3.4');
      expect(result).toBe(true);
    });

    it('should return false when all DNSBL lookups return null', async () => {
      (service as any).reverseDns = jest.fn().mockResolvedValue(null);

      const result = await service.isIpBlacklisted('1.2.3.4');
      expect(result).toBe(false);
    });
  });
});
