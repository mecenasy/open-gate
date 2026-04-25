import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import type {
  CreateTenantResult,
  MutationResult,
  TenantType,
  UpdateTenantFeaturesInput,
} from './dto/tenant-admin.types';
import type {
  TenantCommandConfigType,
  TenantPromptOverrideType,
  TenantPlatformCredentialType,
} from './dto/tenant-admin.types';
import type { CommunityCustomization } from '@app/customization';
import { QuotasClientService } from '../quotas/quotas.client.service';

@Injectable()
export class TenantAdminService implements OnModuleInit {
  private tenantGrpcService!: TenantServiceClient;

  constructor(
    @Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc,
    private readonly quotas: QuotasClientService,
  ) {}

  onModuleInit() {
    this.tenantGrpcService = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  private async getBillingUserIdForTenant(tenantId: string): Promise<string> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenant({ tenantId }));
    if (!res.status || !res.id) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }
    if (!res.billingUserId) {
      throw new NotFoundException(`Tenant ${tenantId} has no billing user — cannot validate plan limits`);
    }
    return res.billingUserId;
  }

  async createTenant(slug: string, billingUserId: string): Promise<CreateTenantResult> {
    await this.quotas.assertCanCreateTenant(billingUserId);
    const res = await lastValueFrom(this.tenantGrpcService.createTenant({ slug, billingUserId }));
    return { id: res.id, slug: res.slug, schemaName: res.schemaName };
  }

  async isTenantSlugAvailable(slug: string): Promise<boolean> {
    const res = await lastValueFrom(this.tenantGrpcService.checkTenantSlug({ slug }));
    return res.isAvailable;
  }

  async getTenantById(tenantId: string): Promise<TenantType | null> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenant({ tenantId }));
    if (!res.status || !res.id) return null;
    return {
      id: res.id,
      slug: res.slug,
      schemaName: res.schemaName,
      isActive: res.isActive,
      billingUserId: res.billingUserId || null,
    };
  }

  async getAllTenants(): Promise<TenantType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getAllTenants({}));
    return res.tenants.map((t) => ({
      id: t.id,
      slug: t.slug,
      schemaName: t.schemaName,
      isActive: t.isActive,
      billingUserId: t.billingUserId || null,
    }));
  }

  async getMyTenants(userId: string): Promise<TenantType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getMyTenants({ userId }));
    return (res.tenants ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      schemaName: t.schemaName,
      isActive: t.isActive,
      billingUserId: t.billingUserId || null,
    }));
  }

  async getTenantsIStaffAt(userId: string) {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantsIStaffAt({ userId }));
    return (res.memberships ?? []).map((m) => ({
      tenantId: m.tenantId,
      tenantSlug: m.tenantSlug,
      role: m.role,
    }));
  }

  async getTenantStaff(tenantId: string) {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantStaff({ tenantId }));
    return res.members.map((m) => ({ tenantId: m.tenantId, userId: m.userId, role: m.role }));
  }

  async isTenantStaff(tenantId: string, userId: string): Promise<{ isMember: boolean; role: string | null }> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantStaffMembership({ tenantId, userId }));
    return { isMember: res.isMember, role: res.role || null };
  }

  async addTenantStaff(tenantId: string, userId: string, role: string): Promise<MutationResult> {
    const billingUserId = await this.getBillingUserIdForTenant(tenantId);
    await this.quotas.assertCanAddStaff(tenantId, billingUserId);
    const res = await lastValueFrom(this.tenantGrpcService.addTenantStaff({ tenantId, userId, role }));
    return { status: res.status, message: res.message };
  }

  async removeTenantStaff(tenantId: string, userId: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.removeTenantStaff({ tenantId, userId }));
    return { status: res.status, message: res.message };
  }

  async changeTenantStaffRole(tenantId: string, userId: string, role: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.changeTenantStaffRole({ tenantId, userId, role }));
    return { status: res.status, message: res.message };
  }

  async addContact(input: {
    tenantId: string;
    email?: string;
    phone?: string;
    name: string;
    surname?: string;
    accessLevel: string;
  }) {
    const billingUserId = await this.getBillingUserIdForTenant(input.tenantId);
    await this.quotas.assertCanAddContact(input.tenantId, billingUserId);
    const res = await lastValueFrom(
      this.tenantGrpcService.addContact({
        tenantId: input.tenantId,
        email: input.email ?? '',
        phone: input.phone ?? '',
        name: input.name,
        surname: input.surname ?? '',
        accessLevel: input.accessLevel,
      }),
    );
    return res;
  }

  async updateContact(contactId: string, input: { email?: string; phone?: string; name?: string; surname?: string }) {
    return lastValueFrom(
      this.tenantGrpcService.updateContact({
        contactId,
        email: input.email ?? '',
        phone: input.phone ?? '',
        name: input.name ?? '',
        surname: input.surname ?? '',
      }),
    );
  }

  async getTenantContacts(tenantId: string) {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantContacts({ tenantId }));
    return res.contacts;
  }

  async removeContactFromTenant(tenantId: string, contactId: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.removeContactFromTenant({ tenantId, contactId }));
    return { status: res.status, message: res.message };
  }

  async updateFeatures(
    tenantId: string,
    current: CommunityCustomization,
    input: UpdateTenantFeaturesInput,
  ): Promise<MutationResult> {
    const updated: CommunityCustomization = {
      ...current,
      features: {
        ...current.features,
        ...(input.enableSignal !== undefined && { enableSignal: input.enableSignal }),
        ...(input.enableWhatsApp !== undefined && { enableWhatsApp: input.enableWhatsApp }),
        ...(input.enableMessenger !== undefined && { enableMessenger: input.enableMessenger }),
        ...(input.enableGate !== undefined && { enableGate: input.enableGate }),
        ...(input.enablePayment !== undefined && { enablePayment: input.enablePayment }),
        ...(input.enableCommandScheduling !== undefined && { enableCommandScheduling: input.enableCommandScheduling }),
        ...(input.enableAnalytics !== undefined && { enableAnalytics: input.enableAnalytics }),
        ...(input.enableAudioRecognition !== undefined && { enableAudioRecognition: input.enableAudioRecognition }),
      },
    };
    return this.updateCustomization(tenantId, JSON.stringify(updated));
  }

  async updateCustomization(tenantId: string, customizationJson: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.updateCustomization({ tenantId, customizationJson }));
    return { status: res.status, message: res.message };
  }

  async transferTenantBilling(tenantId: string, newBillingUserId: string): Promise<MutationResult> {
    await this.quotas.assertCanCreateTenant(newBillingUserId);
    const res = await lastValueFrom(
      this.tenantGrpcService.transferTenantBilling({ tenantId, newBillingUserId }),
    );
    return { status: res.status, message: res.message };
  }

  async setTenantActive(tenantId: string, active: boolean): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.setTenantActive({ tenantId, active }));
    return { status: res.status, message: res.message };
  }

  async deleteTenant(tenantId: string, slugConfirmation: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.deleteTenant({ tenantId, slugConfirmation }));
    return { status: res.status, message: res.message };
  }

  async getTenantPlatformCredentials(tenantId: string): Promise<TenantPlatformCredentialType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getAllPlatformCredentials({ tenantId }));
    return res.items.map((i) => ({ platform: i.platform, configJson: i.configJson, isDefault: i.isDefault }));
  }

  async upsertPlatformCredentials(tenantId: string, platform: string, configJson: string): Promise<MutationResult> {
    const existing = await this.getTenantPlatformCredentials(tenantId);
    const isNew = !existing.some((e) => e.platform === platform && !e.isDefault);
    if (isNew) {
      const billingUserId = await this.getBillingUserIdForTenant(tenantId);
      await this.quotas.assertCanAddPlatform(tenantId, billingUserId);
    }
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertPlatformCredentials({ tenantId, platform, configJson }),
    );
    return { status: res.status, message: res.message };
  }

  async getTenantCommandConfigs(tenantId: string): Promise<TenantCommandConfigType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantCommandConfigs({ tenantId }));
    return res.configs.map((c) => ({
      id: c.id,
      commandName: c.commandName,
      active: c.active,
      parametersOverrideJson: c.parametersOverrideJson || undefined,
      userTypes: c.userTypes ?? [],
      actionsJson: c.actionsJson || undefined,
      descriptionI18nJson: c.descriptionI18nJson || undefined,
    }));
  }

  async upsertTenantCommandConfig(
    tenantId: string,
    commandName: string,
    active: boolean,
    parametersOverrideJson?: string,
    userTypes?: string[],
    actionsJson?: string,
    descriptionI18nJson?: string,
  ): Promise<MutationResult> {
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertTenantCommandConfig({
        tenantId,
        commandName,
        active,
        parametersOverrideJson: parametersOverrideJson ?? '',
        userTypes: userTypes ?? [],
        actionsJson: actionsJson ?? '',
        descriptionI18nJson: descriptionI18nJson ?? '',
      }),
    );
    return { status: res.status, message: res.message };
  }

  async deleteTenantCommandConfig(tenantId: string, commandName: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.deleteTenantCommandConfig({ tenantId, commandName }));
    return { status: res.status, message: res.message };
  }

  async getTenantPromptOverrides(tenantId: string): Promise<TenantPromptOverrideType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantPromptOverrides({ tenantId }));
    const userTypeMap: Record<string, string> = {
      owner: 'OWNER',
      admin: 'ADMIN',
      super_user: 'SUPER_USER',
      member: 'MEMBER',
      user: 'USER',
    };
    return res.overrides.map((o) => ({
      id: o.id,
      tenantId: o.tenantId,
      commandId: o.commandId || undefined,
      userType: userTypeMap[o.userType] ?? o.userType.toUpperCase(),
      descriptionI18nJson: o.descriptionI18nJson || undefined,
      prompt: o.prompt,
    }));
  }

  async upsertTenantPromptOverride(
    tenantId: string,
    userType: string,
    prompt: string,
    commandId?: string,
    descriptionI18nJson?: string,
  ): Promise<MutationResult> {
    const userTypeMap: Record<string, string> = {
      OWNER: 'owner',
      ADMIN: 'admin',
      SUPER_USER: 'super_user',
      MEMBER: 'member',
      USER: 'user',
    };
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertTenantPromptOverride({
        tenantId,
        commandId: commandId ?? '',
        userType: userTypeMap[userType] ?? userType.toLowerCase(),
        prompt,
        descriptionI18nJson: descriptionI18nJson ?? '',
      }),
    );
    return { status: res.status, message: res.message };
  }
}
