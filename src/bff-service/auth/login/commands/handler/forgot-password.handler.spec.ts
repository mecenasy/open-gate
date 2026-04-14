import { of } from 'rxjs';
import { Logger } from '@nestjs/common';
import { ForgotPasswordHandler } from './forgot-password.handler';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import { OtpService } from 'src/bff-service/auth/otp/otp.service';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { CacheService } from '@app/redis';
import { EventService } from '@app/event';
import { SendResetTokenEvent } from 'src/bff-service/notify/common/dto/send-reset-token.event';

describe('ForgotPasswordHandler', () => {
  let handler: ForgotPasswordHandler;
  let mockOtpService: jest.Mocked<Pick<OtpService, 'generateToken'>>;
  let mockCache: jest.Mocked<Pick<CacheService, 'saveInCache'>>;
  let mockEvent: jest.Mocked<Pick<EventService, 'emit'>>;
  let mockGrpcService: { getUserByEmail: jest.Mock };

  beforeEach(() => {
    mockOtpService = { generateToken: jest.fn().mockReturnValue('reset-uuid-token') };
    mockCache = { saveInCache: jest.fn().mockResolvedValue(undefined) };
    mockEvent = { emit: jest.fn() };
    mockGrpcService = { getUserByEmail: jest.fn() };

    handler = new ForgotPasswordHandler(mockOtpService as unknown as OtpService);
    Object.assign(handler, {
      cache: mockCache,
      event: mockEvent,
      gRpcService: mockGrpcService,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should always return forgotPassword status regardless of whether user exists', async () => {
    mockGrpcService.getUserByEmail.mockReturnValue(of(null));

    const result = await handler.execute(new ForgotPasswordCommand('missing@example.com'));

    expect(result).toEqual({ status: AuthStatus.forgotPassword });
  });

  it('should generate token, cache email, and emit event when user is found', async () => {
    mockGrpcService.getUserByEmail.mockReturnValue(of({ data: { email: 'user@example.com', id: 'user-1' } }));

    await handler.execute(new ForgotPasswordCommand('user@example.com'));

    expect(mockOtpService.generateToken).toHaveBeenCalledTimes(1);
    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'reset-uuid-token',
        data: 'user@example.com',
        EX: 600,
        prefix: 'forgot-password',
      }),
    );
    expect(mockEvent.emit).toHaveBeenCalledWith(expect.any(SendResetTokenEvent));
  });

  it('should NOT cache or emit when user is not found', async () => {
    mockGrpcService.getUserByEmail.mockReturnValue(of(null));

    await handler.execute(new ForgotPasswordCommand('ghost@example.com'));

    expect(mockCache.saveInCache).not.toHaveBeenCalled();
    expect(mockEvent.emit).not.toHaveBeenCalled();
  });

  it('should return forgotPassword status even when user exists', async () => {
    mockGrpcService.getUserByEmail.mockReturnValue(of({ data: { email: 'user@example.com', id: 'user-1' } }));

    const result = await handler.execute(new ForgotPasswordCommand('user@example.com'));

    expect(result).toEqual({ status: AuthStatus.forgotPassword });
  });
});
