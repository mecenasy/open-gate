import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { Accept2faHandler } from './accept-2fa.handler';
import { Accept2faCommand } from '../impl/accept-2fa.command';
import { CacheService } from '@app/redis';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

jest.mock('@otplib/preset-default', () => ({
  authenticator: {
    generateSecret: jest.fn().mockReturnValue('GENERATEDBASE32SECRET'),
    keyuri: jest.fn().mockReturnValue('otpauth://totp/user@example.com?secret=GENERATEDBASE32SECRET'),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockImplementation((_uri, cb) => cb(null, 'data:image/png;base64,qrcode')),
}));

const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };

describe('Accept2faHandler', () => {
  let handler: Accept2faHandler;
  let mockGrpc: { getLoginStatus: jest.Mock };
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'saveInCache'>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGrpc = { getLoginStatus: jest.fn() };
    mockCache = {
      getFromCache: jest.fn().mockResolvedValue(null),
      saveInCache: jest.fn().mockResolvedValue(undefined),
    };

    handler = new Accept2faHandler();
    Object.assign(handler, { gRpcService: mockGrpc, cache: mockCache, logger: mockLogger });
  });

  it('should return accept2fa status with QR dataUrl when user is in cache', async () => {
    mockCache.getFromCache.mockResolvedValue({ email: 'user@example.com', id: 'user-1' });

    const result = await handler.execute(new Accept2faCommand('user-1'));

    expect(result.status).toBe(AuthStatus.accept2fa);
    expect(result.dataUrl).toBe('data:image/png;base64,qrcode');
    expect(mockGrpc.getLoginStatus).not.toHaveBeenCalled();
  });

  it('should fetch user email from gRPC when not in cache', async () => {
    mockCache.getFromCache.mockResolvedValue(null);
    mockGrpc.getLoginStatus.mockReturnValue(
      of({ message: null, userStatus: { email: 'grpc@example.com' } }),
    );

    const result = await handler.execute(new Accept2faCommand('user-1'));

    expect(result.status).toBe(AuthStatus.accept2fa);
    expect(mockGrpc.getLoginStatus).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('should throw NotFoundException when gRPC returns message and no user', async () => {
    mockCache.getFromCache.mockResolvedValue(null);
    mockGrpc.getLoginStatus.mockReturnValue(
      of({ message: 'USER_NOT_FOUND', userStatus: null }),
    );

    await expect(handler.execute(new Accept2faCommand('bad-id'))).rejects.toThrow(NotFoundException);
  });

  it('should save generated secret to 2fa-state cache', async () => {
    mockCache.getFromCache.mockResolvedValue({ email: 'user@example.com', id: 'user-1' });

    await handler.execute(new Accept2faCommand('user-1'));

    expect(mockCache.saveInCache).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'user-1',
        prefix: '2fa-state',
        data: 'GENERATEDBASE32SECRET',
      }),
    );
  });
});
