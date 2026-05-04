import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GateGrpcModule, config as gateGrpcConfig } from '@app/gate-grpc';
import { BffGrpcModule, config as bffGrpcConfig } from '@app/bff-grpc';
import { config as dbGrpcConfig } from '@app/db-grpc';
import { signalConfig } from './outgoing/platforms/signal/config/signal.config';
import { MessageBridgeModule } from './incoming/message-bridge.module';
import { OutgoingNotifyModule } from './outgoing/outgoing-notify.module';
import { LoggerModule } from '@app/logger';
import { envValidationSchema } from 'src/config/env.validation';
import { PlatformConfigModule } from './platform-config/platform-config.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PhoneProcurementModule } from './phone-procurement/phone-procurement.module';
import { SignalVerificationModule } from './signal-verification/signal-verification.module';
import { ContactBindingModule } from './contact-binding/contact-binding.module';

@Module({
  imports: [
    LoggerModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gateGrpcConfig, signalConfig, dbGrpcConfig, bffGrpcConfig],
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
    BffGrpcModule,
    PlatformConfigModule,
    SignalVerificationModule,
    OnboardingModule,
    PhoneProcurementModule,
    ContactBindingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
