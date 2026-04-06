import { CommandHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { AcceptAdaptiveLoginCommand } from '../impl/accept-adaptive-login.command';
import { SETTINGS_PROXY_SERVICE_NAME, SettingsProxyServiceClient } from 'src/proto/user-settings';
import { AcceptAdaptiveLoginType } from '../../dto/accept-adaptive-login.type';
import { Handler } from 'src/bff-service/common/handler/handler';
import { LoginStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';

@CommandHandler(AcceptAdaptiveLoginCommand)
export class AcceptAdaptiveLoginHandler extends Handler<
  AcceptAdaptiveLoginCommand,
  AcceptAdaptiveLoginType,
  SettingsProxyServiceClient
> {
  constructor() {
    super(SETTINGS_PROXY_SERVICE_NAME);
  }

  async execute({ id }: AcceptAdaptiveLoginCommand): Promise<AcceptAdaptiveLoginType> {
    const { active } = await lastValueFrom(this.gRpcService.acceptAdaptive({ id }));

    const user = await this.cache.getFromCache<LoginStatusType['user']>({
      identifier: id,
      prefix: 'user-state',
    });
    if (user) {
      user.isAdaptiveLoginEnabled = active;

      await this.cache.saveInCache<LoginStatusType['user']>({
        identifier: id,
        prefix: 'user-state',
        EX: 3600,
        data: user,
      });
    }

    return { active };
  }
}
