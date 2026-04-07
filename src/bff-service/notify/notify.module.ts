import { Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { SmtpModule } from './smtp/smtp.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [SmsModule, SmtpModule, SocketModule],
})

export class NotifyModule {}
