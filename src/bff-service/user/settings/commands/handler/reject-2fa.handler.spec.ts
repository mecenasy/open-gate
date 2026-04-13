import { of } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { Reject2faHandler } from './reject-2fa.handler';
import { Reject2FaCommand } from '../impl/reject-2fa.command';
import { CacheService } from '@app/redis';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('Reject2faHandler', () => {
  let handler: Reject2faHandler;
  let mockGrpc: { reject2Fa: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'saveInCache'>>;

  beforeEach(() => {
    mockGrpc = { reject2Fa: jest.fn() };
    mockCache = {
      getFromCache: jest.fn().mockResolvedValue(null),
      saveInCache: jest.fn().mockResolvedValue(undefined),
    };

    handler = new Reject2faHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should return reject2fa status on success', async () => {
    mockGrpc.reject2Fa.mockReturnValue(of({ status: true, message: null }));

    const result = await handler.execute(new Reject2FaCommand('user-1'));

    expect(result).toEqual({ status: AuthStatus.reject2fa });
  });

  it('should throw InternalServerErrorException when gRPC returns message', async () => {
    mockGrpc.reject2Fa.mockReturnValue(of({ status: false, message: 'Failed' }));

    await expect(handler.execute(new Reject2FaCommand('user-1'))).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should update cache entry to set is2faEnabled=false when user exists in cache', async () => {
    mockGrpc.reject2Fa.mockReturnValue(of({ status: true, message: null }));
    mockCache.getFromCache.mockResolvedValue({
      id: 'user-1',
      email: 'u@example.com',
      is2faEnabled: true,
      admin: false,
      owner: false,
      isAdaptiveLoginEnabled: false,
    });

    await handler.execute(new Reject2FaCommand('user-1'));

    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ is2faEnabled: false }),
      }),
    );
  });

  it('should NOT update cache when user is not cached', async () => {
    mockGrpc.reject2Fa.mockReturnValue(of({ status: true, message: null }));
    mockCache.getFromCache.mockResolvedValue(null);

    await handler.execute(new Reject2FaCommand('user-1'));

    expect(mockCache.saveInCache).not.toHaveBeenCalled();
  });
});
