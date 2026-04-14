import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GateGrpcModule, config as gateGrpcConfig } from '@app/gate-grpc';
import { signalConfig } from './outgoing/platforms/signal/config/signal.config';
import { MessageBridgeModule } from './incoming/message-bridge.module';
import { OutgoingNotifyModule } from './outgoing/outgoing-notify.module';
import { LoggerModule } from '@app/logger';
import { envValidationSchema } from 'src/config/env.validation';
import { PlatformConfigModule } from './platform-config/platform-config.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gateGrpcConfig, signalConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    MessageBridgeModule,
    OutgoingNotifyModule,
    CqrsModule,
    GateGrpcModule,
    PlatformConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
