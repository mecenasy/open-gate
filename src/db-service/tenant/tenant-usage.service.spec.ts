import { TenantUsageService } from './tenant-usage.service';
import type { TenantDbService } from './tenant.service';
import type { TenantStaffService } from './tenant-staff.service';
import type { PlatformCredentialsService } from './platform-credentials.service';
import type { ContactService } from '../contact/contact.service';
import type { CommandService } from '../command/command.service';
import type { Tenant } from './entity/tenant.entity';

const tenant = (id: string): Tenant => ({ id, slug: id, schemaName: `tenant_${id}` }) as Tenant;

describe('TenantUsageService', () => {
  let service: TenantUsageService;
  let tenants: jest.Mocked<Pick<TenantDbService, 'findByBillingUserId'>>;
  let staff: jest.Mocked<Pick<TenantStaffService, 'countForTenant'>>;
  let platforms: jest.Mocked<Pick<PlatformCredentialsService, 'countForTenant'>>;
  let contacts: jest.Mocked<Pick<ContactService, 'countForTenant'>>;
  let commands: jest.Mocked<Pick<CommandService, 'countCustomForTenant'>>;

  beforeEach(() => {
    tenants = { findByBillingUserId: jest.fn() };
    staff = { countForTenant: jest.fn() };
    platforms = { countForTenant: jest.fn() };
    contacts = { countForTenant: jest.fn() };
    commands = { countCustomForTenant: jest.fn() };

    service = new TenantUsageService(
      tenants as unknown as TenantDbService,
      staff as unknown as TenantStaffService,
      platforms as unknown as PlatformCredentialsService,
      contacts as unknown as ContactService,
      commands as unknown as CommandService,
    );
  });

  it('returns zero usage when user has no tenants', async () => {
    tenants.findByBillingUserId.mockResolvedValue([]);

    const report = await service.getForBillingUser('user-1');

    expect(report).toEqual({ billingUserId: 'user-1', tenants: 0, perTenant: [] });
    expect(staff.countForTenant).not.toHaveBeenCalled();
  });

  it('aggregates per-tenant counts across all dependencies', async () => {
    tenants.findByBillingUserId.mockResolvedValue([tenant('a'), tenant('b')]);
    staff.countForTenant.mockImplementation(async (id) => (id === 'a' ? 3 : 7));
    platforms.countForTenant.mockImplementation(async (id) => (id === 'a' ? 1 : 5));
    contacts.countForTenant.mockImplementation(async (id) => (id === 'a' ? 10 : 25));
    commands.countCustomForTenant.mockImplementation(async (id) => (id === 'a' ? 0 : 2));

    const report = await service.getForBillingUser('user-1');

    expect(report.tenants).toBe(2);
    expect(report.perTenant).toEqual([
      { tenantId: 'a', staff: 3, platforms: 1, contacts: 10, customCommands: 0 },
      { tenantId: 'b', staff: 7, platforms: 5, contacts: 25, customCommands: 2 },
    ]);
  });

  it('getForTenant returns single-tenant slice', async () => {
    staff.countForTenant.mockResolvedValue(4);
    platforms.countForTenant.mockResolvedValue(2);
    contacts.countForTenant.mockResolvedValue(11);
    commands.countCustomForTenant.mockResolvedValue(1);

    const entry = await service.getForTenant('tenant-x');

    expect(entry).toEqual({ tenantId: 'tenant-x', staff: 4, platforms: 2, contacts: 11, customCommands: 1 });
    expect(tenants.findByBillingUserId).not.toHaveBeenCalled();
  });
});
