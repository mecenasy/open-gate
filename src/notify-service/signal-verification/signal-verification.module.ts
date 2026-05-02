import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { SignalVerificationBridgeService } from './signal-verification-bridge.service';
import { VerificationForwarderService } from './verification-forwarder.service';

/**
 * Standalone module so both OnboardingModule and MessageBridgeModule can
 * pull in SignalVerificationBridgeService without creating a cycle —
 * OnboardingModule already imports MessageBridgeModule, so the bridge
 * service can't live in either of them directly.
 *
 * VerificationForwarderService pushes captured codes to bff-service over
 * gRPC; BffGrpcModule is `@Global()` so no explicit import here.
 */
@Module({
  imports: [RedisModule],
  providers: [SignalVerificationBridgeService, VerificationForwarderService],
  exports: [SignalVerificationBridgeService, VerificationForwarderService],
})
export class SignalVerificationModule {}
