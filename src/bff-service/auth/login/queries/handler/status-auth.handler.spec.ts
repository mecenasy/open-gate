import { of } from 'rxjs';
import { Logger } from '@nestjs/common';
import { LoginStatusHandler } from './status-auth.handler';
import { StatusAuthQuery } from '../impl/status-auth.query';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { CacheService } from '@app/redis';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';

describe('LoginStatusHandler', () => {
  let handler: LoginStatusHandler;
  let mockConfigService: jest.Mocked<Pick<TypeConfigService, 'get'>>;
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'saveInCache'>>;
  let mockGrpcService: { getLoginStatus: jest.Mock };

  const grpcUserStatus = {
    admin: false,
    owner: true,
    email: 'user@example.com',
    is2fa: true,
    isAdaptive: false,
  };

  const expectedUser = {
    id: 'user-1',
    admin: false,
    owner: true,
    email: 'user@example.com',
    is2faEnabled: true,
    isAdaptiveLoginEnabled: false,
  };

  beforeEach(() => {
    mockConfigService = { get: jest.fn() };
    mockCache = {
      getFromCache: jest.fn().mockResolvedValue(null),
      saveInCache: jest.fn().mockResolvedValue(undefined),
    };
    mockGrpcService = {
      getLoginStatus: jest.fn().mockReturnValue(of({ message: null, userStatus: grpcUserStatus })),
    };

    handler = new LoginStatusHandler(mockConfigService as unknown as TypeConfigService);
    Object.assign(handler, {
      cache: mockCache,
      gRpcService: mockGrpcService,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should return logout status when userId is empty string', async () => {
    const result = await handler.execute(new StatusAuthQuery(''));

    expect(result).toEqual({ status: AuthStatus.logout });
    expect(mockGrpcService.getLoginStatus).not.toHaveBeenCalled();
  });

  it('should return cached user data when present in cache', async () => {
    mockCache.getFromCache.mockResolvedValue(expectedUser);

    const result = await handler.execute(new StatusAuthQuery('user-1'));

    expect(result).toEqual({ status: AuthStatus.login, user: expectedUser });
    expect(mockGrpcService.getLoginStatus).not.toHaveBeenCalled();
  });

  it('should fetch from gRPC and cache result when cache is empty', async () => {
    mockCache.getFromCache.mockResolvedValue(null);
    mockGrpcService.getLoginStatus.mockReturnValue(of({ message: null, userStatus: grpcUserStatus }));

    const result = await handler.execute(new StatusAuthQuery('user-1'));

    expect(result).toEqual({ status: AuthStatus.login, user: expectedUser });
    expect(mockGrpcService.getLoginStatus).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'user-1',
        prefix: 'user-state',
        EX: 3600,
        data: expectedUser,
      }),
    );
  });

  it('should return logout status when gRPC returns message (user not found)', async () => {
    mockCache.getFromCache.mockResolvedValue(null);
    mockGrpcService.getLoginStatus.mockReturnValue(of({ message: 'USER_NOT_FOUND', userStatus: null }));

    const result = await handler.execute(new StatusAuthQuery('ghost-user'));

    expect(result).toEqual({ status: AuthStatus.logout, message: 'User not found' });
    expect(mockCache.saveInCache).not.toHaveBeenCalled();
  });

  it('should return logout status when gRPC returns no userStatus', async () => {
    mockCache.getFromCache.mockResolvedValue(null);
    mockGrpcService.getLoginStatus.mockReturnValue(of({ message: null, userStatus: null }));

    const result = await handler.execute(new StatusAuthQuery('user-1'));

    expect(result).toEqual({ status: AuthStatus.logout, message: 'User not found' });
  });

  it('should check cache with correct prefix', async () => {
    await handler.execute(new StatusAuthQuery('user-1'));

    expect(mockCache.getFromCache).toHaveBeenCalledWith({
      identifier: 'user-1',
      prefix: 'user-state',
    });
  });
});
