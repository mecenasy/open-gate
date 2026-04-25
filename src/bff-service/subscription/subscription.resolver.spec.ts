import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionResolver } from './subscription.resolver';
import type { SubscriptionClientService, PlanChangeKind } from './subscription.service';
import type { QuotasClientService } from '../quotas/quotas.client.service';
import type { CacheService } from '@app/redis';
import type { SubscriptionPlanType, UserSubscriptionType } from './dto/subscription.types';

const plan = (overrides: Partial<SubscriptionPlanType> = {}): SubscriptionPlanType => ({
  id: 'plan-1',
  code: 'standard',
  name: 'Standard',
  maxTenants: 3,
  maxPlatformsPerTenant: 5,
  maxContactsPerTenant: 50,
  maxStaffPerTenant: 4,
  maxCustomCommandsPerTenant: 10,
  priceCents: 999,
  currency: 'EUR',
  isActive: true,
  ...overrides,
});

const subscription = (p: SubscriptionPlanType): UserSubscriptionType => ({
  id: 'sub-1',
  planId: p.id,
  status: 'active',
  startedAt: '2026-04-25T00:00:00.000Z',
  plan: p,
});

describe('SubscriptionResolver', () => {
  let resolver: SubscriptionResolver;
  let subs: jest.Mocked<
    Pick<
      SubscriptionClientService,
      'getPlanById' | 'getUserSubscription' | 'classifyChange' | 'selectSubscription' | 'cancelSubscription'
    >
  >;
  let quotas: jest.Mocked<Pick<QuotasClientService, 'listViolations'>>;
  let cache: jest.Mocked<Pick<CacheService, 'removeFromCache'>>;

  beforeEach(() => {
    subs = {
      getPlanById: jest.fn(),
      getUserSubscription: jest.fn(),
      classifyChange: jest.fn(),
      selectSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
    };
    quotas = { listViolations: jest.fn() };
    cache = { removeFromCache: jest.fn().mockResolvedValue(undefined) };

    resolver = new SubscriptionResolver(
      subs as unknown as SubscriptionClientService,
      quotas as unknown as QuotasClientService,
      cache as unknown as CacheService,
    );
  });

  describe('previewPlanChange', () => {
    it('returns initial preview for new subscriptions', async () => {
      const target = plan({ id: 'pro' });
      subs.getPlanById.mockResolvedValue(target);
      subs.getUserSubscription.mockResolvedValue(null);
      subs.classifyChange.mockReturnValue('initial');

      const preview = await resolver.previewPlanChange('pro', 'user-1');

      expect(preview.kind).toBe('initial');
      expect(preview.violations).toEqual([]);
      expect(preview.deltaPriceCents).toBe(target.priceCents);
      expect(quotas.listViolations).not.toHaveBeenCalled();
    });

    it('skips violation lookup for upgrades', async () => {
      const current = plan({ id: 'std' });
      const target = plan({ id: 'pro', priceCents: 1999 });
      subs.getPlanById.mockResolvedValue(target);
      subs.getUserSubscription.mockResolvedValue(subscription(current));
      subs.classifyChange.mockReturnValue('upgrade');

      const preview = await resolver.previewPlanChange('pro', 'user-1');

      expect(preview.kind).toBe('upgrade');
      expect(preview.violations).toEqual([]);
      expect(preview.deltaPriceCents).toBe(1000);
      expect(quotas.listViolations).not.toHaveBeenCalled();
    });

    it('reports violations for downgrades', async () => {
      const current = plan({ id: 'pro' });
      const target = plan({ id: 'minimal', maxTenants: 1, priceCents: 0 });
      subs.getPlanById.mockResolvedValue(target);
      subs.getUserSubscription.mockResolvedValue(subscription(current));
      subs.classifyChange.mockReturnValue('downgrade');
      quotas.listViolations.mockResolvedValue([
        { kind: 'tenants', current: 3, max: 1 },
      ]);

      const preview = await resolver.previewPlanChange('minimal', 'user-1');

      expect(preview.kind).toBe('downgrade');
      expect(preview.violations).toEqual([{ kind: 'tenants', current: 3, max: 1, tenantId: undefined }]);
      expect(preview.deltaPriceCents).toBe(-current.priceCents);
    });

    it('throws when plan does not exist', async () => {
      subs.getPlanById.mockResolvedValue(null);
      await expect(resolver.previewPlanChange('ghost', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('selectSubscription', () => {
    it('blocks downgrade with violations', async () => {
      const current = plan({ id: 'pro' });
      const target = plan({ id: 'minimal', maxTenants: 1 });
      subs.getPlanById.mockResolvedValue(target);
      subs.getUserSubscription.mockResolvedValue(subscription(current));
      subs.classifyChange.mockReturnValue('downgrade');
      quotas.listViolations.mockResolvedValue([{ kind: 'tenants', current: 3, max: 1 }]);

      const err = await resolver.selectSubscription({ planId: 'minimal' }, 'user-1').catch((e) => e);

      expect(err).toBeInstanceOf(BadRequestException);
      expect((err as BadRequestException).getResponse()).toMatchObject({
        code: 'PLAN_DOWNGRADE_BLOCKED',
        violations: [{ kind: 'tenants', current: 3, max: 1 }],
      });
      expect(subs.selectSubscription).not.toHaveBeenCalled();
      expect(cache.removeFromCache).not.toHaveBeenCalled();
    });

    it('passes through upgrade and invalidates user-state cache', async () => {
      const current = plan({ id: 'std' });
      const target = plan({ id: 'pro' });
      subs.getPlanById.mockResolvedValue(target);
      subs.getUserSubscription.mockResolvedValue(subscription(current));
      subs.classifyChange.mockReturnValue('upgrade');
      subs.selectSubscription.mockResolvedValue(subscription(target));

      const result = await resolver.selectSubscription({ planId: 'pro' }, 'user-1');

      expect(result.plan.id).toBe('pro');
      expect(subs.selectSubscription).toHaveBeenCalledWith('user-1', 'pro', { kind: 'upgrade' as PlanChangeKind });
      expect(cache.removeFromCache).toHaveBeenCalledWith({ identifier: 'user-1', prefix: 'user-state' });
    });

    it('allows clean downgrade when there are no violations', async () => {
      const current = plan({ id: 'pro' });
      const target = plan({ id: 'minimal' });
      subs.getPlanById.mockResolvedValue(target);
      subs.getUserSubscription.mockResolvedValue(subscription(current));
      subs.classifyChange.mockReturnValue('downgrade');
      quotas.listViolations.mockResolvedValue([]);
      subs.selectSubscription.mockResolvedValue(subscription(target));

      await resolver.selectSubscription({ planId: 'minimal' }, 'user-1');

      expect(subs.selectSubscription).toHaveBeenCalled();
      expect(cache.removeFromCache).toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('cancels and invalidates cache', async () => {
      subs.cancelSubscription.mockResolvedValue(true);
      const ok = await resolver.cancelSubscription('user-1');
      expect(ok).toBe(true);
      expect(cache.removeFromCache).toHaveBeenCalledWith({ identifier: 'user-1', prefix: 'user-state' });
    });
  });
});
