import { Logger } from '@nestjs/common';
import { VerifyCodeHandler } from './verify-code.handler';
import { VerifyCodeCommand } from '../impl/verify-code.command';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { CacheService } from '@app/redis';
import { SessionData } from 'express-session';

const makeSession = (): SessionData & { user_id?: string } =>
  ({
    user_id: undefined,
    save: jest.fn((cb: (err: null) => void) => cb(null)),
  }) as unknown as SessionData & { user_id?: string };

describe('MFA VerifyCodeHandler', () => {
  let handler: VerifyCodeHandler;
  let mockCache: jest.Mocked<Pick<CacheService, 'getFromCache' | 'removeFromCache'>>;

  beforeEach(() => {
    mockCache = {
      getFromCache: jest.fn(),
      removeFromCache: jest.fn().mockResolvedValue(undefined),
    };

    handler = new VerifyCodeHandler();
    Object.assign(handler, {
      cache: mockCache,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should return login status and set session.user_id when code matches', async () => {
    const session = makeSession();
    mockCache.getFromCache.mockResolvedValue({ code: 123456, userId: 'user-1' });

    const result = await handler.execute(new VerifyCodeCommand('user@example.com', 123456, session));

    expect(result).toEqual({ status: AuthStatus.login });
    expect(session.user_id).toBe('user-1');
    expect(mockCache.removeFromCache).toHaveBeenCalledWith({ identifier: 'user@example.com' });
  });

  it('should return logout status when code does not match cached code', async () => {
    const session = makeSession();
    mockCache.getFromCache.mockResolvedValue({ code: 999999, userId: 'user-1' });

    const result = await handler.execute(new VerifyCodeCommand('user@example.com', 111111, session));

    expect(result).toEqual({ status: AuthStatus.logout });
    expect(session.user_id).toBeUndefined();
    expect(mockCache.removeFromCache).not.toHaveBeenCalled();
  });

  it('should return logout status when no cache entry exists', async () => {
    const session = makeSession();
    mockCache.getFromCache.mockResolvedValue(null);

    const result = await handler.execute(new VerifyCodeCommand('user@example.com', 123456, session));

    expect(result).toEqual({ status: AuthStatus.logout });
  });

  it('should call getFromCache with the email as identifier', async () => {
    const session = makeSession();
    mockCache.getFromCache.mockResolvedValue(null);

    await handler.execute(new VerifyCodeCommand('test@example.com', 123456, session));

    expect(mockCache.getFromCache).toHaveBeenCalledWith({ identifier: 'test@example.com' });
  });

  it('should call session.save after successful verification', async () => {
    const session = makeSession();
    mockCache.getFromCache.mockResolvedValue({ code: 555555, userId: 'user-2' });

    await handler.execute(new VerifyCodeCommand('user@example.com', 555555, session));

    expect(session.save).toHaveBeenCalledTimes(1);
  });
});
