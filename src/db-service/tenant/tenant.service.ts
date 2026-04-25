import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entity/tenant.entity';
import {
  CommunityCustomization,
  CustomizationConfig,
  DEFAULT_CUSTOMIZATION,
  validateMessagingChannels,
} from './entity/customization-config.entity';
import { TenantSchemaManager } from '@app/database';

@Injectable()
export class TenantDbService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(CustomizationConfig)
    private readonly customizationRepo: Repository<CustomizationConfig>,
    private readonly schemaManager: TenantSchemaManager,
  ) {}

  findById(id: string): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: { slug } });
  }

  findAll(): Promise<Tenant[]> {
    return this.tenantRepo.find({ where: { isActive: true } });
  }

  findByBillingUserId(userId: string): Promise<Tenant[]> {
    return this.tenantRepo.find({ where: { billingUserId: userId } });
  }

  countByBillingUserId(userId: string): Promise<number> {
    return this.tenantRepo.count({ where: { billingUserId: userId } });
  }

  async create(slug: string, billingUserId?: string | null): Promise<Tenant> {
    const schemaName = `tenant_${slug.replace(/-/g, '_')}`;
    const tenant = this.tenantRepo.create({
      slug,
      schemaName,
      isActive: true,
      billingUserId: billingUserId ?? null,
    });
    const saved = await this.tenantRepo.save(tenant);

    const config = this.customizationRepo.create({
      tenantId: saved.id,
      config: DEFAULT_CUSTOMIZATION,
    });
    const savedConfig = await this.customizationRepo.save(config);

    await this.tenantRepo.update(saved.id, { customizationId: savedConfig.id });
    await this.schemaManager.provisionSchema(schemaName);

    return { ...saved, customizationId: savedConfig.id };
  }

  async getCustomization(tenantId: string): Promise<CommunityCustomization> {
    const config = await this.customizationRepo.findOne({ where: { tenantId } });
    return config?.config ?? DEFAULT_CUSTOMIZATION;
  }

  async updateCustomization(tenantId: string, patch: Partial<CommunityCustomization>): Promise<void> {
    const existing = await this.customizationRepo.findOne({ where: { tenantId } });
    if (!existing) {
      throw new NotFoundException(`Customization not found for tenant ${tenantId}`);
    }

    const updated = { ...existing.config, ...patch };

    const channels = patch.messaging?.priorityChannels;
    if (channels) {
      try {
        validateMessagingChannels(channels);
      } catch (err) {
        throw new BadRequestException((err as Error).message);
      }
    }

    existing.config = updated;
    await this.customizationRepo.save(existing);
  }

  async transferBilling(tenantId: string, newBillingUserId: string): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }
    await this.tenantRepo.update(tenantId, { billingUserId: newBillingUserId });
  }

  async setActive(tenantId: string, active: boolean): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }
    await this.tenantRepo.update(tenantId, { isActive: active });
  }

  async hardDelete(tenantId: string, slugConfirmation: string): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }
    if (tenant.slug !== slugConfirmation) {
      throw new BadRequestException(
        `Slug confirmation mismatch — expected "${tenant.slug}", got "${slugConfirmation}"`,
      );
    }

    const schemaName = tenant.schemaName;

    // FK CASCADE on tenants.id deletes tenant_staff, contact_memberships,
    // platform_credentials, tenant_command_config, tenant_prompt_overrides.
    // customization_config has no FK in the current schema — drop it explicitly.
    await this.tenantRepo.manager.transaction(async (manager) => {
      await manager.delete(CustomizationConfig, { tenantId });
      await manager.delete(this.tenantRepo.target, { id: tenantId });
    });

    // Schema drop is irreversible and lives outside the transaction —
    // do it last so a failure here leaves the rest intact for retry.
    await this.schemaManager.dropSchema(schemaName);
  }
}
