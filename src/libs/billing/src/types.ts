export interface BillingPlanRef {
  id: string;
  code: string;
  priceCents: number;
  currency: string;
}

export interface BillingChangePreview {
  /** Net amount to charge now (positive = charge, negative = refund/credit). */
  proratedCents: number;
  /** When the new price starts being charged on the recurring schedule. */
  effectiveAt: Date;
  /** Provider-specific identifier referencing the upcoming invoice / proposal, if any. */
  proposalId?: string;
}

export interface BillingApplyResult {
  /** Provider's persistent subscription identifier (set on first apply, stable thereafter). */
  externalSubscriptionId: string;
  /** End of the currently-paid period — used to schedule a deferred cancel. */
  currentPeriodEnd: Date | null;
  /** Reflects what the provider actually executed (NoopBillingProvider always returns same date as preview). */
  effectiveAt: Date;
}

export interface BillingCancelResult {
  /** When `atPeriodEnd: true`, the user keeps access until this date; null = immediate cancel. */
  effectiveAt: Date | null;
}

export interface BillingChangeContext {
  userId: string;
  externalSubscriptionId?: string | null;
  fromPlan: BillingPlanRef | null;
  toPlan: BillingPlanRef;
}

export interface BillingCancelContext {
  userId: string;
  externalSubscriptionId?: string | null;
  /** End the subscription at the end of the current paid period instead of immediately. */
  atPeriodEnd: boolean;
}

/**
 * Pluggable billing backend. Real money flows go through implementations
 * such as `StripeBillingProvider`; `NoopBillingProvider` is the placeholder
 * used until a provider is configured.
 *
 * All methods MUST be idempotent — `applyChange` may be retried after a
 * crash and must not double-charge.
 */
export interface BillingProvider {
  /**
   * Inspect what would happen if the user committed the change. Pure read —
   * never persists state on the provider.
   */
  previewChange(context: BillingChangeContext): Promise<BillingChangePreview>;

  /**
   * Commit the change. Returns the provider's view of the resulting
   * subscription so we can persist external identifiers.
   */
  applyChange(context: BillingChangeContext): Promise<BillingApplyResult>;

  /**
   * Cancel the subscription. When `atPeriodEnd: true`, returns the date
   * after which the subscription stops; otherwise returns null and access
   * ends immediately.
   */
  cancel(context: BillingCancelContext): Promise<BillingCancelResult>;
}

export const BILLING_PROVIDER_TOKEN = Symbol.for('app.billing.provider');
