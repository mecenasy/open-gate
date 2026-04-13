import { of } from 'rxjs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Verify2faHandler } from './verify-2fa.handler';
import { Verify2faCommand } from '../impl/verify-2fa.command';
import { CacheService } from '@app/redis';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

jest.mock('@otplib/preset-default', () => ({
  authenticator: { check: jest.fn() },
}));
import { authenticator } from '@otplib/preset-default';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('Verify2faHandler', () => {
  let handler: Verify2faHandler;
  let mockGrpc: { verify2Fa: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'removeFromCache' | 'saveInCache'>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGrpc = { verify2Fa: jest.fn() };
    mockCache = {
      getFromCache: jest.fn(),
      removeFromCache: jest.fn().mockResolvedValue(undefined),
      saveInCache: jest.fn().mockResolvedValue(undefined),
    };

    handler = new Verify2faHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should throw BadRequestException when no 2fa-state in cache', async () => {
    mockCache.getFromCache.mockResolvedValueOnce(null);

    await expect(handler.execute(new Verify2faCommand('user-1', '123456'))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when TOTP code is invalid', async () => {
    mockCache.getFromCache.mockResolvedValueOnce('SECRETKEY');
    (authenticator.check as jest.Mock).mockReturnValue(false);

    await expect(handler.execute(new Verify2faCommand('user-1', '000000'))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw InternalServerErrorException when gRPC verify fails', async () => {
    mockCache.getFromCache.mockResolvedValueOnce('SECRETKEY').mockResolvedValueOnce(null);
    (authenticator.check as jest.Mock).mockReturnValue(true);
    mockGrpc.verify2Fa.mockReturnValue(of({ status: false, message: 'DB error' }));

    await expect(handler.execute(new Verify2faCommand('user-1', '123456'))).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should return reject2fa status on success', async () => {
    mockCache.getFromCache
      .mockResolvedValueOnce('SECRETKEY')  // 2fa-state
      .mockResolvedValueOnce(null);          // user-state (not cached)
    (authenticator.check as jest.Mock).mockReturnValue(true);
    mockGrpc.verify2Fa.mockReturnValue(of({ status: true, message: null }));

    const result = await handler.execute(new Verify2faCommand('user-1', '123456'));

    expect(result).toEqual({ status: AuthStatus.reject2fa });
    expect(mockCache.removeFromCache).toHaveBeenCalledWith({ identifier: 'user-1', prefix: '2fa-state' });
  });

  it('should update user-state cache to set is2faEnabled=true', async () => {
    mockCache.getFromCache
      .mockResolvedValueOnce('SECRETKEY')
      .mockResolvedValueOnce({ id: 'user-1', email: 'u@e.com', is2faEnabled: false, admin: false, owner: false, isAdaptiveLoginEnabled: false });
    (authenticator.check as jest.Mock).mockReturnValue(true);
    mockGrpc.verify2Fa.mockReturnValue(of({ status: true, message: null }));

    await handler.execute(new Verify2faCommand('user-1', '123456'));

    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ is2faEnabled: true }),
      }),
    );
  });
});
