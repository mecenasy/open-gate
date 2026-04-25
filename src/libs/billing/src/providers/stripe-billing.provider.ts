import { Injectable, NotImplementedException } from '@nestjs/common';
import type {
  BillingApplyResult,
  BillingCancelContext,
  BillingCancelResult,
  BillingChangeContext,
  BillingChangePreview,
  BillingProvider,
} from '../types';

/**
 * Placeholder for the real Stripe integration. Methods throw
 * NotImplementedException — the class exists so the DI graph can be
 * wired today and a switch flipped in BillingModule when Stripe goes
 * live, without touching consumer code.
 *
 * When implementing:
 *  - previewChange  → stripe.invoices.upcoming() with proration_date=now
 *  - applyChange    → stripe.subscriptions.update(...) with proration_behavior='create_prorations'
 *  - cancel         → stripe.subscriptions.cancel(...) or .update({ cancel_at_period_end: true })
 *
 * All methods MUST be idempotent — pass an Idempotency-Key header on
 * every Stripe call (e.g. derived from correlationId).
 */
@Injectable()
export class StripeBillingProvider implements BillingProvider {
  previewChange(_context: BillingChangeContext): Promise<BillingChangePreview> {
    throw new NotImplementedException('StripeBillingProvider.previewChange is not yet implemented');
  }

  applyChange(_context: BillingChangeContext): Promise<BillingApplyResult> {
    throw new NotImplementedException('StripeBillingProvider.applyChange is not yet implemented');
  }

  cancel(_context: BillingCancelContext): Promise<BillingCancelResult> {
    throw new NotImplementedException('StripeBillingProvider.cancel is not yet implemented');
  }
}
