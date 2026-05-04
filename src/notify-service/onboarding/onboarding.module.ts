import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisModule } from '@app/redis';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { MessageBridgeModule } from '../incoming/message-bridge.module';
import { SignalVerificationModule } from '../signal-verification/signal-verification.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService, ONBOARDING_PROVIDERS } from './onboarding.service';
import { OnboardingSessionStore } from './onboarding-session.store';
import { SignalOnboardingProvider } from './platforms/signal/signal-onboarding.provider';
import { SignalRestModule } from './platforms/signal/signal-rest.module';

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    RedisModule,
    PlatformConfigModule,
    MessageBridgeModule,
    SignalVerificationModule,
    SignalRestModule,
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    OnboardingSessionStore,
    SignalOnboardingProvider,
    {
      // Multi-provider list — add new platforms here as they ship their own
      // OnboardingProvider implementation.
      provide: ONBOARDING_PROVIDERS,
      inject: [SignalOnboardingProvider],
      useFactory: (signal: SignalOnboardingProvider) => [signal],
    },
  ],
})
export class OnboardingModule {}
