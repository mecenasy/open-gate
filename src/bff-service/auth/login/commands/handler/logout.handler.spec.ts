import { InternalServerErrorException, Logger } from '@nestjs/common';
import { LogoutHandler } from './logout.handler';
import { LogoutCommand } from '../impl/logout.command';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { SessionData } from 'express-session';

const makeSession = (destroyFn: (cb: (err: unknown) => void) => void): SessionData =>
  ({ destroy: jest.fn(destroyFn) }) as unknown as SessionData;

describe('LogoutHandler', () => {
  let handler: LogoutHandler;

  beforeEach(() => {
    handler = new LogoutHandler();
    Object.assign(handler, {
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should destroy the session and return logout status', async () => {
    const session = makeSession((cb) => cb(null));
    const result = await handler.execute(new LogoutCommand('user-1', session));

    expect(result).toEqual({ status: AuthStatus.logout });
    expect(session.destroy).toHaveBeenCalledTimes(1);
  });

  it('should throw InternalServerErrorException when session.destroy fails', async () => {
    const err = new Error('session store unreachable');
    const session = makeSession((cb) => cb(err));

    await expect(handler.execute(new LogoutCommand('user-1', session))).rejects.toThrow(InternalServerErrorException);
  });
});
