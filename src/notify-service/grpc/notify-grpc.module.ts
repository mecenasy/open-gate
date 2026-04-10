import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { OutgoingSignalController } from './outgoing-signal.controller';
import { NotificationController } from './notification.controller';
import { SmsModule } from '../sms/sms.module';
import { SmtpModule } from '../smtp/smtp.module';

@Module({
  imports: [HttpModule, ConfigModule, SmsModule, SmtpModule],
  controllers: [OutgoingSignalController, NotificationController],
})
export class NotifyModule {}
