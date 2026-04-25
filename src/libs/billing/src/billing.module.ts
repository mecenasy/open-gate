import { Module } from '@nestjs/common';
import { NoopBillingProvider } from './providers/noop-billing.provider';
import { BILLING_PROVIDER_TOKEN } from './types';

/**
 * Provides the active BillingProvider for the application. Switch the
 * `useClass` to `StripeBillingProvider` (or feature-flag it via a
 * factory provider reading config) to go live with real billing.
 */
@Module({
  providers: [
    NoopBillingProvider,
    {
      provide: BILLING_PROVIDER_TOKEN,
      useExisting: NoopBillingProvider,
    },
  ],
  exports: [BILLING_PROVIDER_TOKEN],
})
export class BillingModule {}
