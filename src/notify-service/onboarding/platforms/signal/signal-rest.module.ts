import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SignalRestClient } from './signal-rest.client';

// Slim wrapper so the signal-cli REST client can be shared between
// onboarding (register/verify/replace) and tenant cleanup (unregister)
// without one importing the other's full module graph.
@Module({
  imports: [HttpModule],
  providers: [SignalRestClient],
  exports: [SignalRestClient],
})
export class SignalRestModule {}
