import { CommandHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { LoginCommand } from '../impl/login.command';
import { LOGIN_PROXY_SERVICE_NAME, LoginProxyServiceClient } from 'src/proto/login';
import { StatusType } from '../../dto/status.type';
import { Handler } from 'src/bff-service/common/handler/handler';
import { OtpService } from 'src/bff-service/auth/otp/otp.service';
import { RiskService } from 'src/bff-service/auth/risk/risk.service';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { LoginCache } from 'src/bff-service/auth/types/cache-data';
import { SendVerifyCodeEvent } from 'src/bff-service/notify/common/dto/send-verify-code.event';

@CommandHandler(LoginCommand)
export class LoginHandler extends Handler<LoginCommand, StatusType, LoginProxyServiceClient> {
  constructor(
    private readonly otpService: OtpService,
    private readonly riskService: RiskService,
  ) {
    super(LOGIN_PROXY_SERVICE_NAME);
  }

  async execute({ email, password, security }: LoginCommand) {
    const user = await lastValueFrom(
      this.gRpcService.login({
        email,
        password,
        fingerprintHash: security.fingerprint,
      }),
    );

    if (!user.success) {
      if (user.userId && user.isAdaptive && user.history) {
        this.riskService.addFailure(user.userId, security);
      }
      return { status: AuthStatus.logout, message: user.message };
    }

    if (user.isAdaptive && user.history) {
      const risk = await this.riskService.calculateRisk(user.userId ?? '', user.history, security);

      if (risk.score <= 40) {
        return { status: AuthStatus.login, score: risk.score };
      }
    }

    if (user.is2fa) {
      return { status: AuthStatus.tfa };
    }

    const code = this.otpService.generateOtp();

    await this.cache.saveInCache<LoginCache>({
      identifier: email,
      data: { code, userId: user.userId ?? '' },
    });

    this.event.emit(new SendVerifyCodeEvent(user.phone ?? '', email, code));

    return { status: AuthStatus.sms };
  }
}
