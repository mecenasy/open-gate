import { SubscriptionClientService } from './subscription.service';
import type { ClientGrpc } from '@nestjs/microservices';
import type { SubscriptionPlanType } from './dto/subscription.types';

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

describe('SubscriptionClientService.classifyChange', () => {
  let service: SubscriptionClientService;

  beforeEach(() => {
    const grpcClient: ClientGrpc = {
      getService: jest.fn().mockReturnValue({}),
      getClientByServiceName: jest.fn(),
    };
    service = new SubscriptionClientService(grpcClient);
  });

  it("returns 'initial' when there is no current subscription", () => {
    expect(service.classifyChange(null, plan())).toBe('initial');
  });

  it("returns 'same' when picking the same plan", () => {
    const p = plan();
    expect(service.classifyChange(p, p)).toBe('same');
  });

  it("returns 'upgrade' when at least one limit grows and none shrinks", () => {
    const current = plan({ id: 'p1', maxTenants: 1, priceCents: 100 });
    const target = plan({ id: 'p2', maxTenants: 5, priceCents: 500 });
    expect(service.classifyChange(current, target)).toBe('upgrade');
  });

  it("returns 'downgrade' when any limit shrinks (overrides upgrades on other fields)", () => {
    const current = plan({ id: 'p1', maxTenants: 5, maxStaffPerTenant: 4 });
    const target = plan({ id: 'p2', maxTenants: 10, maxStaffPerTenant: 2 });
    expect(service.classifyChange(current, target)).toBe('downgrade');
  });

  it("returns 'same' when limits are unchanged but plan id differs", () => {
    const current = plan({ id: 'p1' });
    const target = plan({ id: 'p2' });
    expect(service.classifyChange(current, target)).toBe('same');
  });
});
