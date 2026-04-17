import { CommandHandler } from '@nestjs/cqrs';
import { VerifyPasskeyCommand } from '../impl/verify-passkey.command.';
import { PASSKEY_PROXY_SERVICE_NAME, PasskeyProxyServiceClient } from 'src/proto/passkey';
import { Handler } from '@app/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { lastValueFrom } from 'rxjs';
import { verification } from '../../helpers/verification';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';

@CommandHandler(VerifyPasskeyCommand)
export class VerifyPasskeyHandler extends Handler<VerifyPasskeyCommand, StatusType, PasskeyProxyServiceClient> {
  private clientUrl: string;
  constructor(private readonly configService: TypeConfigService) {
    super(PASSKEY_PROXY_SERVICE_NAME);
    this.clientUrl = this.configService.get<AppConfig>('app')?.clientUrl ?? '';
  }

  async execute({ session, response, origin }: VerifyPasskeyCommand) {
    const challenge = session.currentChallenge;

    if (!challenge) {
      return { status: AuthStatus.logout };
    }

    const passkey = await lastValueFrom(this.gRpcService.getPasskey({ credentialID: response.id }));

    if (!passkey.success) {
      return { status: AuthStatus.logout };
    }

    const verify = await verification(response, origin as string | undefined, this.clientUrl, challenge, passkey);

    if (verify.verified) {
      session.user_id = passkey.userId;
      session.currentChallenge = undefined;

      await saveSession(session, this.logger);

      await lastValueFrom(
        this.gRpcService.setCounter({
          credentialID: response.id,
          counter: verify.authenticationInfo.newCounter,
        }),
      );

      return { status: AuthStatus.login };
    } else {
      return { status: AuthStatus.logout };
    }
  }
}
