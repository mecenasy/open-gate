import { CommandHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Verify2faCommand } from '../impl/verify-2fa.command';
import { SETTINGS_PROXY_SERVICE_NAME, SettingsProxyServiceClient } from 'src/proto/user-settings';
import { authenticator } from '@otplib/preset-default';
import { Handler } from '@app/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { LoginStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(Verify2faCommand)
export class Verify2faHandler extends Handler<Verify2faCommand, StatusType, SettingsProxyServiceClient> {
  constructor() {
    super(SETTINGS_PROXY_SERVICE_NAME);
  }

  async execute({ id, code }: Verify2faCommand): Promise<StatusType> {
    const result = await this.cache.getFromCache<string>({
      identifier: id,
      prefix: '2fa-state',
    });

    if (!result) {
      throw new BadRequestException('2FA already not verified');
    }

    const verified = this.verifySecret(code, result);

    if (!verified) {
      throw new BadRequestException('2FA already not verified');
    }

    const { status, message } = await lastValueFrom(this.gRpcService.verify2Fa({ id, secret: result }));

    if (message || !status) {
      throw new InternalServerErrorException('Failed to verify 2FA');
    }

    await this.cache.removeFromCache({
      identifier: id,
      prefix: '2fa-state',
    });

    const data = await this.cache.getFromCache<LoginStatusType['user']>({
      identifier: id,
      prefix: 'user-state',
    });

    if (data) {
      data.is2faEnabled = true;

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

  private verifySecret(code: string, secret: string) {
    return authenticator.check(code, secret);
  }
}
