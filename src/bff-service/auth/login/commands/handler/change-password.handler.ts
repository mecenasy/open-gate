import { CommandHandler } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';
import { BadRequestException } from '@nestjs/common';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { LOGIN_PROXY_SERVICE_NAME, LoginProxyServiceClient } from 'src/proto/login';
import { lastValueFrom } from 'rxjs';
import { Handler } from 'src/bff-service/common/handler/handler';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler extends Handler<ChangePasswordCommand, StatusType, LoginProxyServiceClient> {
  constructor() {
    super(LOGIN_PROXY_SERVICE_NAME);
  }

  async execute({ userId, newPassword, oldPassword }: ChangePasswordCommand) {
    const { message, success } = await lastValueFrom(
      this.gRpcService.changePassword({ userId, newPassword, oldPassword }),
    );

    if (!success) {
      throw new BadRequestException(message);
    }

    return { status: AuthStatus.changePassword };
  }
}
