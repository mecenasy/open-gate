import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { OutgoingNotifyController } from './outdoing-notify.controller';
import { SmsModule } from '../sms/sms.module';
import { SmtpModule } from '../smtp/smtp.module';
import { SignalSender } from './platforms/signal/signal-sender';
import { Sender } from './platforms/sender';
import { OutgoingNotifyBridgeHandler } from './handler/outdoing-notify.handler';

@Module({
  imports: [HttpModule, ConfigModule, CqrsModule, SmsModule, SmtpModule],
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
  ],
  controllers: [OutgoingNotifyController],
})
export class OutgoingNotifyModule {}
