import { Injectable } from '@nestjs/common';
import type {
  BillingApplyResult,
  BillingCancelContext,
  BillingCancelResult,
  BillingChangeContext,
  BillingChangePreview,
  BillingProvider,
} from '../types';

/**
 * Stand-in billing provider used until a real backend (Stripe, PayU, …)
 * is wired up. All operations succeed instantly with zero charge:
 *  - previewChange returns 0 prorated cents and now() as effective date,
 *  - applyChange synthesizes a deterministic external id so the field
 *    is non-null in the DB,
 *  - cancel returns null effectiveAt for immediate cancellation, or now()
 *    when atPeriodEnd is requested (no real period to wait out).
 *
 * Behaviour intentionally avoids any "later" semantics — the cron that
 * promotes ScheduledCancellation → Canceled handles the deferred case.
 */
@Injectable()
export class NoopBillingProvider implements BillingProvider {
  async previewChange(_context: BillingChangeContext): Promise<BillingChangePreview> {
    return {
      proratedCents: 0,
      effectiveAt: new Date(),
    };
  }

  async applyChange(context: BillingChangeContext): Promise<BillingApplyResult> {
    return {
      externalSubscriptionId: context.externalSubscriptionId ?? `noop_${context.userId}`,
      currentPeriodEnd: null,
      effectiveAt: new Date(),
    };
  }

  async cancel(context: BillingCancelContext): Promise<BillingCancelResult> {
    return {
      effectiveAt: context.atPeriodEnd ? new Date() : null,
    };
  }
}
