import { NoopBillingProvider } from './noop-billing.provider';

describe('NoopBillingProvider', () => {
  let provider: NoopBillingProvider;

  beforeEach(() => {
    provider = new NoopBillingProvider();
  });

  it('previewChange returns zero proration and now()', async () => {
    const before = Date.now();
    const result = await provider.previewChange({
      userId: 'u1',
      fromPlan: null,
      toPlan: { id: 'p1', code: 'standard', priceCents: 999, currency: 'EUR' },
    });
    expect(result.proratedCents).toBe(0);
    expect(result.effectiveAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('applyChange synthesizes a deterministic external id when none exists', async () => {
    const result = await provider.applyChange({
      userId: 'user-42',
      fromPlan: null,
      toPlan: { id: 'p1', code: 'standard', priceCents: 999, currency: 'EUR' },
    });
    expect(result.externalSubscriptionId).toBe('noop_user-42');
    expect(result.currentPeriodEnd).toBeNull();
  });

  it('applyChange preserves an existing external id (idempotent across plan changes)', async () => {
    const result = await provider.applyChange({
      userId: 'user-42',
      externalSubscriptionId: 'sub_abc',
      fromPlan: { id: 'p0', code: 'minimal', priceCents: 0, currency: 'EUR' },
      toPlan: { id: 'p1', code: 'pro', priceCents: 1999, currency: 'EUR' },
    });
    expect(result.externalSubscriptionId).toBe('sub_abc');
  });

  it('cancel returns null effectiveAt for immediate cancellation', async () => {
    const result = await provider.cancel({ userId: 'u1', atPeriodEnd: false });
    expect(result.effectiveAt).toBeNull();
  });

  it('cancel returns now() effectiveAt when atPeriodEnd is requested', async () => {
    const before = Date.now();
    const result = await provider.cancel({ userId: 'u1', atPeriodEnd: true });
    expect(result.effectiveAt).not.toBeNull();
    expect(result.effectiveAt!.getTime()).toBeGreaterThanOrEqual(before);
  });
});
