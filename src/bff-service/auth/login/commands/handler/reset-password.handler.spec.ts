import { of } from 'rxjs';
import { BadRequestException, Logger } from '@nestjs/common';
import { ResetPasswordHandler } from './reset-password.handler';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { CacheService } from '@app/redis';

describe('ResetPasswordHandler', () => {
  let handler: ResetPasswordHandler;
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache'>>;
  let mockGrpcService: { resetPassword: jest.Mock };

  beforeEach(() => {
    mockCache = { getFromCache: jest.fn() };
    mockGrpcService = { resetPassword: jest.fn() };

    handler = new ResetPasswordHandler();
    Object.assign(handler, {
      cache: mockCache,
      gRpcService: mockGrpcService,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should throw BadRequestException with TOKEN_EXPIRED when token is not in cache', async () => {
    mockCache.getFromCache.mockResolvedValue(null);

    await expect(handler.execute(new ResetPasswordCommand('expired-token', 'NewPass1!'))).rejects.toThrow(
      BadRequestException,
    );

    await expect(handler.execute(new ResetPasswordCommand('expired-token', 'NewPass1!'))).rejects.toThrow(
      'TOKEN_EXPIRED',
    );
  });

  it('should return resetPassword status on successful reset', async () => {
    mockCache.getFromCache.mockResolvedValue('user@example.com');
    mockGrpcService.resetPassword.mockReturnValue(of({ success: true, message: null }));

    const result = await handler.execute(new ResetPasswordCommand('valid-token', 'NewPass1!'));

    expect(result).toEqual({ status: AuthStatus.resetPassword });
    expect(mockGrpcService.resetPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'NewPass1!',
    });
  });

  it('should throw BadRequestException with gRPC error message when reset fails', async () => {
    mockCache.getFromCache.mockResolvedValue('user@example.com');
    mockGrpcService.resetPassword.mockReturnValue(of({ success: false, message: 'PASSWORD_REUSE_NOT_ALLOWED' }));

    await expect(handler.execute(new ResetPasswordCommand('valid-token', 'OldPass1!'))).rejects.toThrow(
      'PASSWORD_REUSE_NOT_ALLOWED',
    );
  });

  it('should look up cache with correct prefix and token as identifier', async () => {
    mockCache.getFromCache.mockResolvedValue(null);

    try {
      await handler.execute(new ResetPasswordCommand('my-token', 'pass'));
    } catch {
      // expected
    }

    expect(mockCache.getFromCache).toHaveBeenCalledWith({
      identifier: 'my-token',
      prefix: 'forgot-password',
    });
  });
});
