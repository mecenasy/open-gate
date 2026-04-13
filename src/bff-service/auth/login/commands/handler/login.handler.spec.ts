import { of } from 'rxjs';
import { Logger } from '@nestjs/common';
import { LoginHandler } from './login.handler';
import { LoginCommand } from '../impl/login.command';
import { OtpService } from 'src/bff-service/auth/otp/otp.service';
import { RiskService } from 'src/bff-service/auth/risk/risk.service';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { CacheService } from '@app/redis';
import { EventService } from '@app/event';
import { Security } from 'src/bff-service/common/interceptors/security-context.interceptor';
import { SendVerifyCodeEvent } from 'src/bff-service/notify/common/dto/send-verify-code.event';

const security: Security = {
  origin: 'https://app.example.com',
  fingerprint: 'fp-abc123',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  location: {
    ip: '1.2.3.4',
    city: 'Warsaw',
    country: 'PL',
    coordinates: [52.2297, 21.0122],
    timezone: 'Europe/Warsaw',
  },
};

const history = {
  failureCount: 0,
  lastFailureAt: null,
  updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastScore: 10,
  lastIp: '1.2.3.4',
  userAgent: 'Mozilla/5.0',
};

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let mockOtpService: jest.Mocked<Pick<OtpService, 'generateOtp'>>;
  let mockRiskService: jest.Mocked<Pick<RiskService, 'calculateRisk' | 'addFailure'>>;
  let mockCache: jest.Mocked<Pick<CacheService, 'saveInCache'>>;
  let mockEvent: jest.Mocked<Pick<EventService, 'emit'>>;
  let mockGrpcService: { login: jest.Mock };

  beforeEach(() => {
    mockOtpService = { generateOtp: jest.fn().mockReturnValue(123456) };
    mockRiskService = {
      calculateRisk: jest.fn().mockResolvedValue({ score: 10, reasons: [] }),
      addFailure: jest.fn(),
    };
    mockCache = { saveInCache: jest.fn().mockResolvedValue(undefined) };
    mockEvent = { emit: jest.fn() };
    mockGrpcService = { login: jest.fn() };

    handler = new LoginHandler(
      mockOtpService as unknown as OtpService,
      mockRiskService as unknown as RiskService,
    );
    Object.assign(handler, {
      cache: mockCache,
      event: mockEvent,
      gRpcService: mockGrpcService,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  describe('failed login', () => {
    it('should return logout status when gRPC returns success=false', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: false, userId: null, isAdaptive: false, history: null, message: 'Invalid credentials' }),
      );

      const result = await handler.execute(new LoginCommand('user@example.com', 'wrong', security));

      expect(result).toEqual({ status: AuthStatus.logout, message: 'Invalid credentials' });
    });

    it('should call addFailure when adaptive login is enabled and userId is present', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: false, userId: 'user-1', isAdaptive: true, history, message: 'Bad pass' }),
      );

      await handler.execute(new LoginCommand('user@example.com', 'wrong', security));

      expect(mockRiskService.addFailure).toHaveBeenCalledWith('user-1', security);
    });

    it('should NOT call addFailure when login fails without adaptive flag', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: false, userId: null, isAdaptive: false, history: null, message: 'bad' }),
      );

      await handler.execute(new LoginCommand('user@example.com', 'wrong', security));

      expect(mockRiskService.addFailure).not.toHaveBeenCalled();
    });
  });

  describe('successful login', () => {
    it('should return login status when risk score <= 40 with adaptive enabled', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: true, userId: 'user-1', isAdaptive: true, is2fa: false, history, phone: '+48100200300' }),
      );
      mockRiskService.calculateRisk.mockResolvedValue({ score: 30, reasons: [] });

      const result = await handler.execute(new LoginCommand('user@example.com', 'pass', security));

      expect(result).toEqual({ status: AuthStatus.login, score: 30 });
      expect(mockRiskService.calculateRisk).toHaveBeenCalledWith('user-1', history, security);
    });

    it('should proceed to sms flow when risk score > 40', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: true, userId: 'user-1', isAdaptive: true, is2fa: false, history, phone: '+48100200300' }),
      );
      mockRiskService.calculateRisk.mockResolvedValue({ score: 75, reasons: ['NEW_DEVICE'] });

      const result = await handler.execute(new LoginCommand('user@example.com', 'pass', security));

      expect(result).toEqual({ status: AuthStatus.sms });
    });

    it('should return tfa status when user has 2FA enabled', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: true, userId: 'user-2', isAdaptive: false, is2fa: true, history: null, phone: null }),
      );

      const result = await handler.execute(new LoginCommand('user@example.com', 'pass', security));

      expect(result).toEqual({ status: AuthStatus.tfa });
    });

    it('should return sms status and cache OTP for standard flow', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: true, userId: 'user-3', isAdaptive: false, is2fa: false, history: null, phone: '+48100200300' }),
      );
      mockOtpService.generateOtp.mockReturnValue(654321);

      const result = await handler.execute(new LoginCommand('user@example.com', 'pass', security));

      expect(result).toEqual({ status: AuthStatus.sms });
      expect(mockCache.saveInCache).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'user@example.com',
          data: { code: 654321, userId: 'user-3' },
        }),
      );
    });

    it('should emit SendVerifyCodeEvent with correct phone, email, code', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: true, userId: 'user-3', isAdaptive: false, is2fa: false, history: null, phone: '+48500600700' }),
      );
      mockOtpService.generateOtp.mockReturnValue(111111);

      await handler.execute(new LoginCommand('user@example.com', 'pass', security));

      expect(mockEvent.emit).toHaveBeenCalledWith(expect.any(SendVerifyCodeEvent));
    });

    it('should NOT calculate risk when adaptive login is disabled', async () => {
      mockGrpcService.login.mockReturnValue(
        of({ success: true, userId: 'user-4', isAdaptive: false, is2fa: false, history: null, phone: '+48000000000' }),
      );

      await handler.execute(new LoginCommand('user@example.com', 'pass', security));

      expect(mockRiskService.calculateRisk).not.toHaveBeenCalled();
    });
  });
});
