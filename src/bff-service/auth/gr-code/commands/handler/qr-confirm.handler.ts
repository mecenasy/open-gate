import { CommandHandler } from '@nestjs/cqrs';
import { QrConfirmCommand } from '../impl/qr-confirm.command';
import { QrCache } from './types/types';
import { BadRequestException } from '@nestjs/common';
import { PASSKEY_PROXY_SERVICE_NAME, PasskeyProxyServiceClient } from 'src/proto/passkey';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { Getaway } from 'src/bff-service/common/getaway/getaway.getaway';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { AppConfig } from 'src/gate-service/common/configs/app.configs';
import { verification } from 'src/bff-service/auth/passkey/helpers/verification';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';

@CommandHandler(QrConfirmCommand)
export class QrConfirmHandler extends Handler<QrConfirmCommand, StatusType, PasskeyProxyServiceClient> {
  constructor(
    private readonly gateway: Getaway,
    private readonly configService: TypeConfigService,
  ) {
    super(PASSKEY_PROXY_SERVICE_NAME);
  }

  async execute({ challenge, response }: QrConfirmCommand) {
    if (!challenge) {
      throw new BadRequestException('Challenge is required');
    }

    const result = await this.cache.getFromCache<QrCache>({
      identifier: challenge,
      prefix: 'qr-challenge',
    });

    if (result?.status !== 'optioned' || result.challenge !== challenge) {
      throw new BadRequestException('Wrong challenge');
    }

    const passkey = await lastValueFrom(this.gRpcService.getPasskey({ credentialID: response.id }));

    if (!passkey.success) {
      return { status: AuthStatus.logout };
    }
    const clientUrl = this.configService.get<AppConfig>('app')?.clientUrl ?? '';

    const verify = await verification(response, clientUrl, result.optionChallenge ?? '', passkey);

    await lastValueFrom(
      this.gRpcService.setCounter({
        credentialID: response.id,
        counter: verify.authenticationInfo.newCounter,
      }),
    );

    if (verify.verified) {
      this.sendAuthStatus('verified', result);
      await this.cache.saveInCache<QrCache>({
        identifier: challenge,
        prefix: 'qr-challenge',
        EX: 60,
        data: { ...result, userId: passkey.userId, status: 'verified' },
      });
    } else {
      this.sendAuthStatus('unVerified', result);
      await this.cache.removeFromCache({
        identifier: challenge,
        prefix: 'qr-challenge',
      });
    }
    return { status: AuthStatus.login };
  }

  private sendAuthStatus(status: 'rejected' | 'verified' | 'unVerified', qrAuth: QrCache) {
    this.gateway.server.to(qrAuth.challenge).emit('challenge', {
      status,
      type: 'QR-AUTH',
      nonce: qrAuth.nonce,
    });
  }
}
