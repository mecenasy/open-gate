import { Injectable } from '@nestjs/common';
import type { TenantUsageEntry, UsageReport } from '@app/quotas';
import { TenantDbService } from './tenant.service';
import { TenantStaffService } from './tenant-staff.service';
import { PlatformCredentialsService } from './platform-credentials.service';
import { ContactService } from '../contact/contact.service';
import { CommandService } from '../command/command.service';

@Injectable()
export class TenantUsageService {
  constructor(
    private readonly tenants: TenantDbService,
    private readonly staff: TenantStaffService,
    private readonly platforms: PlatformCredentialsService,
    private readonly contacts: ContactService,
    private readonly commands: CommandService,
  ) {}

  async getForBillingUser(billingUserId: string): Promise<UsageReport> {
    const tenants = await this.tenants.findByBillingUserId(billingUserId);

    const perTenant: TenantUsageEntry[] = await Promise.all(
      tenants.map(async (t) => ({
        tenantId: t.id,
        staff: await this.staff.countForTenant(t.id),
        platforms: await this.platforms.countForTenant(t.id),
        contacts: await this.contacts.countForTenant(t.id),
        customCommands: await this.commands.countCustomForTenant(t.id),
      })),
    );

    return {
      billingUserId,
      tenants: tenants.length,
      perTenant,
    };
  }

  async getForTenant(tenantId: string): Promise<TenantUsageEntry> {
    return {
      tenantId,
      staff: await this.staff.countForTenant(tenantId),
      platforms: await this.platforms.countForTenant(tenantId),
      contacts: await this.contacts.countForTenant(tenantId),
      customCommands: await this.commands.countCustomForTenant(tenantId),
    };
  }
}
