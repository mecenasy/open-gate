import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SmsModule } from './sms/sms.module';
import { SmtpModule } from './smtp/smtp.module';
import { GateGrpcModule, config as gateGrpcConfig } from '@app/gate-grpc';
import { MessageBridgeModule } from './incoming/message-bridge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [gateGrpcConfig] }),
    MessageBridgeModule,
    CqrsModule,
    SmsModule,
    SmtpModule,
    GateGrpcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
