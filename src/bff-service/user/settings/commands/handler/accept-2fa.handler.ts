import { CommandHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { Accept2faCommand } from '../impl/accept-2fa.command';
import { authenticator } from '@otplib/preset-default';
import { AcceptType } from '../../dto/accept-2fa.type';
import { LOGIN_PROXY_SERVICE_NAME, LoginProxyServiceClient } from 'src/proto/login';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { Handler } from '@app/handler';
import { LoginStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(Accept2faCommand)
export class Accept2faHandler extends Handler<Accept2faCommand, AcceptType, LoginProxyServiceClient> {
  constructor() {
    super(LOGIN_PROXY_SERVICE_NAME);
  }

  async execute({ id }: Accept2faCommand): Promise<AcceptType> {
    const user = await this.cache.getFromCache<LoginStatusType['user']>({
      identifier: id,
      prefix: 'user-state',
    });

    let email = user?.email;

    if (!user?.email) {
      const { message, userStatus } = await lastValueFrom(this.gRpcService.getLoginStatus({ userId: id }));

      if (message || !userStatus) {
        throw new NotFoundException('User not found');
      }
      email = userStatus.email;
    }

    const { uri, secret } = this.generateSecret(email as string);
    const dataUrl = await this.generateQrCode(uri);

    await this.cache.saveInCache({
      identifier: id,
      prefix: '2fa-state',
      data: secret,
    });

    return {
      status: AuthStatus.accept2fa,
      dataUrl,
    };
  }

  private async generateQrCode(uri: string) {
    return await new Promise<string>((resolve, reject) => {
      toDataURL(uri, (error, dataUrl) => {
        if (error) {
          reject(new InternalServerErrorException('Failed to generate QR code.'));
        }

        resolve(dataUrl);
      });
    });
  }

  private generateSecret(login: string) {
    const secret: string = authenticator.generateSecret();
    const uri = authenticator.keyuri(login, 'authenticator', secret);

    return {
      uri,
      secret,
    };
  }
}
