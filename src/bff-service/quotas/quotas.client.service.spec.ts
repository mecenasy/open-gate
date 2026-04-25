import { of } from 'rxjs';
import { QuotasClientService } from './quotas.client.service';
import { PlanLimitExceededException } from '@app/quotas';
import type { ClientGrpc } from '@nestjs/microservices';
import type { SubscriptionClientService } from '../subscription/subscription.service';
import type { TenantServiceClient } from 'src/proto/tenant';
import type { SubscriptionPlanType } from '../subscription/dto/subscription.types';

const plan = (overrides: Partial<SubscriptionPlanType> = {}): SubscriptionPlanType => ({
  id: 'plan-id',
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

describe('QuotasClientService', () => {
  let service: QuotasClientService;
  let subscriptions: jest.Mocked<Pick<SubscriptionClientService, 'getLimitsForUser'>>;
  let tenantGrpc: jest.Mocked<Pick<TenantServiceClient, 'getTenantUsage'>>;

  beforeEach(() => {
    tenantGrpc = { getTenantUsage: jest.fn() };
    subscriptions = { getLimitsForUser: jest.fn() };

    const grpcClient: ClientGrpc = {
      getService: jest.fn().mockReturnValue(tenantGrpc),
      getClientByServiceName: jest.fn(),
    };

    service = new QuotasClientService(grpcClient, subscriptions as unknown as SubscriptionClientService);
    service.onModuleInit();
  });

  describe('assertCanCreateTenant', () => {
    it('passes when tenant count is below the limit', async () => {
      subscriptions.getLimitsForUser.mockResolvedValue(plan({ maxTenants: 3 }));
      tenantGrpc.getTenantUsage.mockReturnValue(of({ status: true, message: 'OK', tenants: 2, perTenant: [] }));

      await expect(service.assertCanCreateTenant('user-1')).resolves.toBeUndefined();
    });

    it('throws when tenant count equals the limit', async () => {
      subscriptions.getLimitsForUser.mockResolvedValue(plan({ maxTenants: 3 }));
      tenantGrpc.getTenantUsage.mockReturnValue(of({ status: true, message: 'OK', tenants: 3, perTenant: [] }));

      const err = await service.assertCanCreateTenant('user-1').catch((e) => e);
      expect(err).toBeInstanceOf(PlanLimitExceededException);
      const payload = (err as PlanLimitExceededException).getPayload();
      expect(payload).toMatchObject({
        code: 'PLAN_LIMIT_EXCEEDED',
        kind: 'tenants',
        current: 3,
        max: 3,
        planCode: 'standard',
      });
    });

    it('throws when user has no subscription', async () => {
      subscriptions.getLimitsForUser.mockResolvedValue(null);

      await expect(service.assertCanCreateTenant('user-1')).rejects.toBeInstanceOf(PlanLimitExceededException);
    });
  });

  describe('per-tenant assertions', () => {
    beforeEach(() => {
      subscriptions.getLimitsForUser.mockResolvedValue(plan());
    });

    it('assertCanAddStaff passes below limit', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 1,
          perTenant: [{ tenantId: 't1', staff: 2, platforms: 0, contacts: 0, customCommands: 0 }],
        }),
      );

      await expect(service.assertCanAddStaff('t1', 'user-1')).resolves.toBeUndefined();
    });

    it('assertCanAddStaff throws at limit', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 1,
          perTenant: [{ tenantId: 't1', staff: 4, platforms: 0, contacts: 0, customCommands: 0 }],
        }),
      );

      const err = await service.assertCanAddStaff('t1', 'user-1').catch((e) => e);
      expect(err).toBeInstanceOf(PlanLimitExceededException);
      expect((err as PlanLimitExceededException).getPayload()).toMatchObject({
        kind: 'staff',
        current: 4,
        max: 4,
        tenantId: 't1',
      });
    });

    it('assertCanAddPlatform throws at limit', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 1,
          perTenant: [{ tenantId: 't1', staff: 0, platforms: 5, contacts: 0, customCommands: 0 }],
        }),
      );

      await expect(service.assertCanAddPlatform('t1', 'user-1')).rejects.toBeInstanceOf(PlanLimitExceededException);
    });

    it('assertCanAddContact throws at limit', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 1,
          perTenant: [{ tenantId: 't1', staff: 0, platforms: 0, contacts: 50, customCommands: 0 }],
        }),
      );

      await expect(service.assertCanAddContact('t1', 'user-1')).rejects.toBeInstanceOf(PlanLimitExceededException);
    });

    it('assertCanAddCustomCommand throws at limit', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 1,
          perTenant: [{ tenantId: 't1', staff: 0, platforms: 0, contacts: 0, customCommands: 10 }],
        }),
      );

      await expect(service.assertCanAddCustomCommand('t1', 'user-1')).rejects.toBeInstanceOf(
        PlanLimitExceededException,
      );
    });

    it('treats missing tenant entry as zero usage (allows first add)', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(of({ status: true, message: 'OK', tenants: 0, perTenant: [] }));

      await expect(service.assertCanAddStaff('t1', 'user-1')).resolves.toBeUndefined();
    });
  });

  describe('listViolations (downgrade preview)', () => {
    it('returns empty list when usage fits new plan', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 1,
          perTenant: [{ tenantId: 't1', staff: 1, platforms: 1, contacts: 1, customCommands: 0 }],
        }),
      );

      const violations = await service.listViolations('user-1', plan());
      expect(violations).toEqual([]);
    });

    it('reports violations across kinds when downgrading', async () => {
      tenantGrpc.getTenantUsage.mockReturnValue(
        of({
          status: true,
          message: 'OK',
          tenants: 5,
          perTenant: [
            { tenantId: 't1', staff: 10, platforms: 6, contacts: 100, customCommands: 0 },
            { tenantId: 't2', staff: 1, platforms: 0, contacts: 0, customCommands: 0 },
          ],
        }),
      );

      const violations = await service.listViolations('user-1', plan());

      expect(violations).toContainEqual({ kind: 'tenants', current: 5, max: 3 });
      expect(violations).toContainEqual({ kind: 'staff', tenantId: 't1', current: 10, max: 4 });
      expect(violations).toContainEqual({ kind: 'platforms', tenantId: 't1', current: 6, max: 5 });
      expect(violations).toContainEqual({ kind: 'contacts', tenantId: 't1', current: 100, max: 50 });
      expect(violations).not.toContainEqual(expect.objectContaining({ tenantId: 't2' }));
    });
  });
});
