import { CommandHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { StatusType } from '../../dto/status.type';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from 'src/bff-service/common/handler/handler';
import { OtpService } from 'src/bff-service/auth/otp/otp.service';
import { SendResetTokenEvent } from 'src/bff-service/notify/common/dto/send-reset-token.event';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler extends Handler<ForgotPasswordCommand, StatusType, UserProxyServiceClient> {
  constructor(private readonly otpService: OtpService) {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ email }: ForgotPasswordCommand) {
    const user = await lastValueFrom(this.gRpcService.getUserByEmail({ email }));

    if (user && user.data) {
      const token = this.otpService.generateToken();

      await this.cache.saveInCache<string>({
        identifier: token,
        data: user.data.email,
        EX: 600,
        prefix: 'forgot-password',
      });

      this.event.emit(new SendResetTokenEvent(user.data.email, token));
    }

    return { status: AuthStatus.forgotPassword };
  }
}
