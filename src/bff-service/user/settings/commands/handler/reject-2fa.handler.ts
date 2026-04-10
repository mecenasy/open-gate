import { CommandHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { Reject2FaCommand } from '../impl/reject-2fa.command';
import { SETTINGS_PROXY_SERVICE_NAME, SettingsProxyServiceClient } from 'src/proto/user-settings';
import { Handler } from '@app/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { LoginStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(Reject2FaCommand)
export class Reject2faHandler extends Handler<Reject2FaCommand, StatusType, SettingsProxyServiceClient> {
  constructor() {
    super(SETTINGS_PROXY_SERVICE_NAME);
  }

  async execute({ id }: Reject2FaCommand): Promise<StatusType> {
    const { status, message } = await lastValueFrom(this.gRpcService.reject2Fa({ id }));

    if (message || !status) {
      throw new InternalServerErrorException('Failed to reject 2FA');
    }

    const data = await this.cache.getFromCache<LoginStatusType['user']>({
      identifier: id,
      prefix: 'user-state',
    });

    if (data) {
      data.is2faEnabled = false;

      await this.cache.saveInCache<LoginStatusType['user']>({
        identifier: id,
        prefix: 'user-state',
        EX: 3600,
        data,
      });
    }

    return {
      status: AuthStatus.reject2fa,
    };
  }
}
