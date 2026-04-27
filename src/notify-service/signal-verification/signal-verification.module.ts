import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { SignalVerificationBridgeService } from './signal-verification-bridge.service';

/**
 * Standalone module so both OnboardingModule and MessageBridgeModule can
 * pull in SignalVerificationBridgeService without creating a cycle —
 * OnboardingModule already imports MessageBridgeModule, so the bridge
 * service can't live in either of them directly.
 */
@Module({
  imports: [RedisModule],
  providers: [SignalVerificationBridgeService],
  exports: [SignalVerificationBridgeService],
})
export class SignalVerificationModule {}
