import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { OutgoingNotifyController } from './outdoing-notify.controller';
import { SmsModule } from '../sms/sms.module';
import { SmtpModule } from '../smtp/smtp.module';
import { SignalSender } from './platforms/signal/signal-sender';
import { Sender } from './platforms/sender';

@Module({
  imports: [HttpModule, ConfigModule, SmsModule, SmtpModule],
  providers: [
    SignalSender,
    {
      provide: Sender,
      useFactory: (signalSender: SignalSender): Sender[] => {
        return [signalSender];
      },
    },
  ],
  controllers: [OutgoingNotifyController],
})
export class OutgoingNotifyModule {}
