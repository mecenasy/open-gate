import { CommandHandler } from '@nestjs/cqrs';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { VerifyRegistrationOptionCommand } from '../impl/verify-registration-option.command';
import { lastValueFrom } from 'rxjs';
import { GetPasskeysResponse, PASSKEY_PROXY_SERVICE_NAME, PasskeyProxyServiceClient } from 'src/proto/passkey';
import { UAParser } from 'ua-parser-js';
import { Handler } from '@app/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(VerifyRegistrationOptionCommand)
export class VerifyRegistrationOptionHandler extends Handler<
  VerifyRegistrationOptionCommand,
  StatusType,
  PasskeyProxyServiceClient
> {
  private clientUrl: string;
  constructor(private readonly configService: TypeConfigService) {
    super(PASSKEY_PROXY_SERVICE_NAME);
    this.clientUrl = this.configService.get<AppConfig>('app')?.clientUrl ?? '';
  }

  async execute({ option, userId, ua }: VerifyRegistrationOptionCommand): Promise<StatusType> {
    const challenge = await this.cache.getFromCache<string>({
      identifier: userId,
      prefix: 'passkey-option',
    });

    if (!challenge) {
      return { status: AuthStatus.logout };
    }

    const url = new URL(this.clientUrl);
    const expectedRPID = url.hostname;

    const verification = await verifyRegistrationResponse({
      response: option,
      expectedChallenge: challenge,
      expectedOrigin: this.clientUrl,
      expectedRPID,
    });

    if (verification.verified) {
      const {
        registrationInfo: { credential },
      } = verification;

      await lastValueFrom(
        this.gRpcService.addPasskey({
          userId,
          credentialID: credential.id,
          publicKey: credential.publicKey,
          deviceName: this.getDeviceName(ua),
        }),
      );

      const passkeys = await lastValueFrom(this.gRpcService.getPasskeys({ userId }));

      if (passkeys) {
        await this.cache.saveInCache<GetPasskeysResponse['passkeys']>({
          identifier: userId,
          prefix: 'passkeys',
          EX: 3600,
          data: passkeys.passkeys,
        });
      }

      return { status: AuthStatus.login };
    } else {
      return { status: AuthStatus.logout };
    }
  }
  private getDeviceName(ua: string) {
    const parser = new UAParser(ua);
    const res = parser.getResult();
    const device = res.device.model || res.os.name || 'Unknown Device';
    const browser = res.browser.name || '';

    return `${device} (${browser})`.trim();
  }
}
