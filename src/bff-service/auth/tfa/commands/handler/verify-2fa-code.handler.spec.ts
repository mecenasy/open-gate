import { of } from 'rxjs';
import { BadRequestException, Logger } from '@nestjs/common';
import { VerifyCodeHandler } from './verify-2fa-code.handler';
import { Verify2faCodeCommand } from '../impl/verify-2fa-code.command';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { SessionData } from 'express-session';

// Mock @otplib/preset-default before importing the handler
jest.mock('@otplib/preset-default', () => ({
  authenticator: {
    check: jest.fn(),
  },
}));

import { authenticator } from '@otplib/preset-default';

const makeSession = (): SessionData & { user_id?: string } =>
  ({
    user_id: undefined,
    save: jest.fn((cb: (err: null) => void) => cb(null)),
  }) as unknown as SessionData & { user_id?: string };

describe('TFA VerifyCodeHandler', () => {
  let handler: VerifyCodeHandler;
  let mockGrpcService: { getUser2FaSecret: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGrpcService = { getUser2FaSecret: jest.fn() };

    handler = new VerifyCodeHandler();
    Object.assign(handler, {
      gRpcService: mockGrpcService,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should return login status and set session.user_id when TOTP code is valid', async () => {
    const session = makeSession();
    mockGrpcService.getUser2FaSecret.mockReturnValue(of({ secret: 'BASE32SECRET', userId: 'user-1' }));
    (authenticator.check as jest.Mock).mockReturnValue(true);

    const result = await handler.execute(new Verify2faCodeCommand('user@example.com', '123456', session));

    expect(result).toEqual({ status: AuthStatus.login });
    expect(session.user_id).toBe('user-1');
    expect(authenticator.check).toHaveBeenCalledWith('123456', 'BASE32SECRET');
  });

  it('should throw BadRequestException when TOTP code is invalid', async () => {
    const session = makeSession();
    mockGrpcService.getUser2FaSecret.mockReturnValue(of({ secret: 'BASE32SECRET', userId: 'user-1' }));
    (authenticator.check as jest.Mock).mockReturnValue(false);

    await expect(handler.execute(new Verify2faCodeCommand('user@example.com', '000000', session))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException with "Wrong code" message when code is invalid', async () => {
    const session = makeSession();
    mockGrpcService.getUser2FaSecret.mockReturnValue(of({ secret: 'BASE32SECRET', userId: 'user-1' }));
    (authenticator.check as jest.Mock).mockReturnValue(false);

    await expect(handler.execute(new Verify2faCodeCommand('user@example.com', '000000', session))).rejects.toThrow(
      'Wrong code',
    );
  });

  it('should throw BadRequestException when gRPC returns no secret', async () => {
    const session = makeSession();
    mockGrpcService.getUser2FaSecret.mockReturnValue(of({ secret: null, userId: null }));

    await expect(handler.execute(new Verify2faCodeCommand('user@example.com', '123456', session))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should call getUser2FaSecret with the correct login email', async () => {
    const session = makeSession();
    mockGrpcService.getUser2FaSecret.mockReturnValue(of({ secret: 'SECRET', userId: 'u1' }));
    (authenticator.check as jest.Mock).mockReturnValue(true);

    await handler.execute(new Verify2faCodeCommand('test@example.com', '123456', session));

    expect(mockGrpcService.getUser2FaSecret).toHaveBeenCalledWith({ login: 'test@example.com' });
  });

  it('should save session after successful verification', async () => {
    const session = makeSession();
    mockGrpcService.getUser2FaSecret.mockReturnValue(of({ secret: 'SECRET', userId: 'u1' }));
    (authenticator.check as jest.Mock).mockReturnValue(true);

    await handler.execute(new Verify2faCodeCommand('user@example.com', '123456', session));

    expect(session.save).toHaveBeenCalledTimes(1);
  });
});
