import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisModule } from '@app/redis';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { MessageBridgeModule } from '../incoming/message-bridge.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService, ONBOARDING_PROVIDERS } from './onboarding.service';
import { OnboardingSessionStore } from './onboarding-session.store';
import { SignalOnboardingProvider } from './platforms/signal/signal-onboarding.provider';
import { SignalRestClient } from './platforms/signal/signal-rest.client';

@Module({
  imports: [HttpModule, CqrsModule, RedisModule, PlatformConfigModule, MessageBridgeModule],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    OnboardingSessionStore,
    SignalRestClient,
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
