import { of } from 'rxjs';
import { BadRequestException, Logger } from '@nestjs/common';
import { ChangePasswordHandler } from './change-password.handler';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

describe('ChangePasswordHandler', () => {
  let handler: ChangePasswordHandler;
  let mockGrpcService: { changePassword: jest.Mock };

  beforeEach(() => {
    mockGrpcService = { changePassword: jest.fn() };

    handler = new ChangePasswordHandler();
    Object.assign(handler, {
      gRpcService: mockGrpcService,
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    });
  });

  it('should return changePassword status when password update succeeds', async () => {
    mockGrpcService.changePassword.mockReturnValue(of({ success: true, message: null }));

    const result = await handler.execute(new ChangePasswordCommand('user-1', 'oldPass1!', 'newPass1!'));

    expect(result).toEqual({ status: AuthStatus.changePassword });
    expect(mockGrpcService.changePassword).toHaveBeenCalledWith({
      userId: 'user-1',
      oldPassword: 'oldPass1!',
      newPassword: 'newPass1!',
    });
  });

  it('should throw BadRequestException with gRPC error message on failure', async () => {
    mockGrpcService.changePassword.mockReturnValue(
      of({ success: false, message: 'OLD_PASSWORD_INCORRECT' }),
    );

    await expect(
      handler.execute(new ChangePasswordCommand('user-1', 'wrongOld', 'newPass1!')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should include the gRPC error message in the exception', async () => {
    mockGrpcService.changePassword.mockReturnValue(
      of({ success: false, message: 'PASSWORD_TOO_WEAK' }),
    );

    await expect(
      handler.execute(new ChangePasswordCommand('user-1', 'old', 'weak')),
    ).rejects.toThrow('PASSWORD_TOO_WEAK');
  });
});
