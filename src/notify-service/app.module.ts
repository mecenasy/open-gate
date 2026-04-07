import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalModule } from './signal/signal.module';
import { SmsModule } from './sms/sms.module';
import { SmtpModule } from './smtp/smtp.module';
import { NotifyGrpcModule } from './grpc/notify-grpc.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CqrsModule, SignalModule, SmsModule, SmtpModule, NotifyGrpcModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
