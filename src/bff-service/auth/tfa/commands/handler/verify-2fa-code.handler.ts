import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { authenticator } from '@otplib/preset-default';
import { lastValueFrom } from 'rxjs';
import { LOGIN_PROXY_SERVICE_NAME, LoginProxyServiceClient } from 'src/proto/login';
import { Verify2faCodeCommand } from '../impl/verify-2fa-code.command';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { Handler } from '@app/handler';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(Verify2faCodeCommand)
export class VerifyCodeHandler extends Handler<Verify2faCodeCommand, StatusType, LoginProxyServiceClient> {
  constructor() {
    super(LOGIN_PROXY_SERVICE_NAME);
  }
  async execute({ code, email, session }: Verify2faCodeCommand): Promise<StatusType> {
    const result = await lastValueFrom(this.gRpcService.getUser2FaSecret({ login: email }));

    if (!result.secret) {
      throw new BadRequestException();
    }

    const verified = this.verifySecret(code, result.secret);

    if (!verified) {
      throw new BadRequestException('Wrong code');
    }

    session.user_id = result.userId;

    await saveSession(session, this.logger);

    return { status: AuthStatus.login };
  }

  private verifySecret(code: string, secret: string) {
    return authenticator.check(code, secret);
  }
}
