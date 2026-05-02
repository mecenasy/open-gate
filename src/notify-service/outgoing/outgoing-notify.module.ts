import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { OutgoingNotifyController } from './outdoing-notify.controller';
import { SmsModule } from './platforms/sms/sms.module';
import { SmtpModule } from './platforms/smtp/smtp.module';
import { SignalSender } from './platforms/signal/signal-sender';
import { Sender } from './platforms/sender';
import { OutgoingNotifyBridgeHandler } from './handler/outdoing-notify.handler';
import { VerificationCodePlatform } from './platforms/base/verification-code-platform';
import { TokenPlatform } from './platforms/base/token-platform';
import { SmsVerificationCodePlatform } from './platforms/sms/sms-verification-code.platform';
import { MailVerificationCodePlatform } from './platforms/smtp/mail-verification-code.platform';
import { MailTokenPlatform } from './platforms/smtp/mail-token.platform';
import { commandHandlers } from './commands/handlers';
import { TenantModule } from '@app/tenant';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { SignalVerificationModule } from '../signal-verification/signal-verification.module';

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    SmsModule,
    SmtpModule,
    TenantModule,
    PlatformConfigModule,
    SignalVerificationModule,
  ],
  providers: [
    SignalSender,
    OutgoingNotifyBridgeHandler,
    {
      provide: Sender,
      useFactory: (signalSender: SignalSender): Sender[] => {
        return [signalSender];
      },
      inject: [SignalSender],
    },
    {
      provide: VerificationCodePlatform,
      useFactory: (
        sms: SmsVerificationCodePlatform,
        mail: MailVerificationCodePlatform,
      ): VerificationCodePlatform[] => {
        return [sms, mail];
      },
      inject: [SmsVerificationCodePlatform, MailVerificationCodePlatform],
    },
    {
      provide: TokenPlatform,
      useFactory: (mail: MailTokenPlatform): TokenPlatform[] => {
        return [mail];
      },
      inject: [MailTokenPlatform],
    },
    ...commandHandlers,
  ],
  controllers: [OutgoingNotifyController],
})
export class OutgoingNotifyModule {}
