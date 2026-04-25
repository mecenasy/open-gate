import { Controller } from '@nestjs/common';
import {
  TenantServiceController,
  TenantServiceControllerMethods,
  GetCustomizationRequest,
  GetCustomizationResponse,
  GetTenantRequest,
  GetTenantResponse,
  GetPlatformCredentialsRequest,
  GetPlatformCredentialsResponse,
  GetTenantsWithPlatformRequest,
  GetTenantsWithPlatformResponse,
  GetAllPlatformCredentialsRequest,
  GetAllPlatformCredentialsResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  CheckTenantSlugRequest,
  CheckTenantSlugResponse,
  GetAllTenantsResponse,
  GetMyTenantsRequest,
  GetMyTenantsResponse,
  GetTenantsIStaffAtRequest,
  GetTenantsIStaffAtResponse,
  UpdateCustomizationRequest,
  UpdateCustomizationResponse,
  UpsertPlatformCredentialsRequest,
  UpsertPlatformCredentialsResponse,
  GetTenantCommandConfigsRequest,
  GetTenantCommandConfigsResponse,
  UpsertTenantCommandConfigRequest,
  UpsertTenantCommandConfigResponse,
  DeleteTenantCommandConfigRequest,
  DeleteTenantCommandConfigResponse,
  GetPromptForContextRequest,
  GetPromptForContextResponse,
  UpsertTenantPromptOverrideRequest,
  UpsertTenantPromptOverrideResponse,
  GetTenantPromptOverridesRequest,
  GetTenantPromptOverridesResponse,
  AddTenantStaffRequest,
  RemoveTenantStaffRequest,
  ChangeTenantStaffRoleRequest,
  TenantStaffMutationResponse,
  GetTenantStaffRequest,
  GetTenantStaffResponse,
  GetTenantStaffMembershipRequest,
  GetTenantStaffMembershipResponse,
  AddContactRequest,
  UpdateContactRequest,
  ContactEntryResponse,
  GetTenantContactsRequest,
  GetTenantContactsResponse,
  RemoveContactFromTenantRequest,
  MutationResponse,
  GetTenantUsageRequest,
  GetTenantUsageResponse,
  TransferTenantBillingRequest,
  SetTenantActiveRequest,
  DeleteTenantRequest,
  RecordAuditEntryRequest,
  GetTenantAuditLogRequest,
  GetTenantAuditLogResponse,
} from 'src/proto/tenant';
import { TenantDbService } from './tenant.service';
import { PlatformCredentialsService } from './platform-credentials.service';
import { TenantCommandConfigService } from './tenant-command-config.service';
import { TenantPromptOverrideService } from './tenant-prompt-override.service';
import { TenantStaffService } from './tenant-staff.service';
import { ContactService } from '../contact/contact.service';
import { TenantUsageService } from './tenant-usage.service';
import { AuditService } from './audit.service';
import type { CommunityCustomization } from './entity/customization-config.entity';
import { TenantPromptOverride, UserType, TenantStaffRole, ContactAccessLevel } from '@app/entities';

function parseTenantStaffRole(value: string): TenantStaffRole {
  const normalized = value?.toLowerCase();
  if (
    normalized === TenantStaffRole.Owner ||
    normalized === TenantStaffRole.Admin ||
    normalized === TenantStaffRole.Support
  ) {
    return normalized;
  }
  throw new Error(`Invalid tenant staff role: ${value}`);
}

function parseAccessLevel(value?: string | null): ContactAccessLevel {
  if (value === ContactAccessLevel.Secondary) return ContactAccessLevel.Secondary;
  return ContactAccessLevel.Primary;
}

@Controller()
@TenantServiceControllerMethods()
export class TenantController implements TenantServiceController {
  constructor(
    private readonly tenantDbService: TenantDbService,
    private readonly platformCredentialsService: PlatformCredentialsService,
    private readonly commandConfigService: TenantCommandConfigService,
    private readonly promptOverrideService: TenantPromptOverrideService,
    private readonly tenantStaffService: TenantStaffService,
    private readonly contactService: ContactService,
    private readonly usageService: TenantUsageService,
    private readonly auditService: AuditService,
  ) {}

  async getCustomization({ tenantId }: GetCustomizationRequest): Promise<GetCustomizationResponse> {
    const config = await this.tenantDbService.getCustomization(tenantId);
    return {
      status: true,
      message: 'Customization retrieved successfully',
      customizationJson: JSON.stringify(config),
    };
  }

  async getTenant({ tenantId }: GetTenantRequest): Promise<GetTenantResponse> {
    const tenant = await this.tenantDbService.findById(tenantId);
    if (!tenant) {
      return {
        status: false,
        message: 'Tenant not found',
        id: '',
        slug: '',
        schemaName: '',
        isActive: false,
        billingUserId: '',
      };
    }
    return {
      status: true,
      message: 'Tenant retrieved successfully',
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
      isActive: tenant.isActive,
      billingUserId: tenant.billingUserId ?? '',
    };
  }

  async getPlatformCredentials({
    tenantId,
    platform,
  }: GetPlatformCredentialsRequest): Promise<GetPlatformCredentialsResponse> {
    const found = await this.platformCredentialsService.findByTenantAndPlatform(tenantId, platform);
    if (!found) {
      return { status: false, message: 'No credentials found', configJson: '', isDefault: false };
    }
    return {
      status: true,
      message: 'Credentials retrieved',
      configJson: JSON.stringify(found.creds.config),
      isDefault: found.isDefault,
    };
  }

  async getAllPlatformCredentials({
    tenantId,
  }: GetAllPlatformCredentialsRequest): Promise<GetAllPlatformCredentialsResponse> {
    const items = await this.platformCredentialsService.findAllForTenant(tenantId);
    return {
      status: true,
      message: 'OK',
      items: items.map((i) => ({ platform: i.platform, configJson: JSON.stringify(i.config), isDefault: i.isDefault })),
    };
  }

  async getTenantsWithPlatform({ platform }: GetTenantsWithPlatformRequest): Promise<GetTenantsWithPlatformResponse> {
    const list = await this.platformCredentialsService.findTenantsWithPlatform(platform);
    return {
      status: true,
      message: 'OK',
      entries: list.map((c) => ({ tenantId: c.tenantId, configJson: JSON.stringify(c.config) })),
    };
  }

  async createTenant({ slug, billingUserId }: CreateTenantRequest): Promise<CreateTenantResponse> {
    const tenant = await this.tenantDbService.create(String(slug), billingUserId || null);
    if (billingUserId) {
      await this.tenantStaffService.add(tenant.id, billingUserId, TenantStaffRole.Owner);
    }
    return {
      status: true,
      message: 'Tenant created successfully',
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
    };
  }

  async checkTenantSlug({ slug }: CheckTenantSlugRequest): Promise<CheckTenantSlugResponse> {
    const normalized = String(slug || '').trim().toLowerCase();
    if (!normalized) {
      return { status: false, message: 'Slug is required', isAvailable: false };
    }
    const existing = await this.tenantDbService.findBySlug(normalized);
    return { status: true, message: 'OK', isAvailable: !existing };
  }

  async getAllTenants(): Promise<GetAllTenantsResponse> {
    const tenants = await this.tenantDbService.findAll();
    return {
      status: true,
      message: 'OK',
      tenants: tenants.map((t) => ({
        id: t.id,
        slug: t.slug,
        schemaName: t.schemaName,
        isActive: t.isActive,
        billingUserId: t.billingUserId ?? '',
      })),
    };
  }

  async getMyTenants({ userId }: GetMyTenantsRequest): Promise<GetMyTenantsResponse> {
    const tenants = await this.tenantDbService.findByBillingUserId(String(userId));
    return {
      status: true,
      message: 'OK',
      tenants: tenants.map((t) => ({
        id: t.id,
        slug: t.slug,
        schemaName: t.schemaName,
        isActive: t.isActive,
        billingUserId: t.billingUserId ?? '',
      })),
    };
  }

  async getTenantsIStaffAt({ userId }: GetTenantsIStaffAtRequest): Promise<GetTenantsIStaffAtResponse> {
    const memberships = await this.tenantStaffService.listForUser(String(userId));
    return {
      status: true,
      message: 'OK',
      memberships: memberships.map((m) => ({
        tenantId: m.tenantId,
        userId: String(userId),
        role: m.role,
        tenantSlug: m.tenantSlug,
      })),
    };
  }

  async addTenantStaff({ tenantId, userId, role }: AddTenantStaffRequest): Promise<TenantStaffMutationResponse> {
    const entry = await this.tenantStaffService.add(String(tenantId), String(userId), parseTenantStaffRole(role));
    return {
      status: true,
      message: 'Staff added',
      entry: { tenantId: entry.tenantId, userId: entry.userId, role: entry.role, tenantSlug: '' },
    };
  }

  async removeTenantStaff({ tenantId, userId }: RemoveTenantStaffRequest): Promise<TenantStaffMutationResponse> {
    const removed = await this.tenantStaffService.remove(String(tenantId), String(userId));
    return {
      status: removed,
      message: removed ? 'Staff removed' : 'Membership not found',
      entry: undefined,
    };
  }

  async changeTenantStaffRole({
    tenantId,
    userId,
    role,
  }: ChangeTenantStaffRoleRequest): Promise<TenantStaffMutationResponse> {
    const entry = await this.tenantStaffService.changeRole(
      String(tenantId),
      String(userId),
      parseTenantStaffRole(role),
    );
    if (!entry) return { status: false, message: 'Membership not found', entry: undefined };
    return {
      status: true,
      message: 'Role changed',
      entry: { tenantId: entry.tenantId, userId: entry.userId, role: entry.role, tenantSlug: '' },
    };
  }

  async getTenantStaff({ tenantId }: GetTenantStaffRequest): Promise<GetTenantStaffResponse> {
    const members = await this.tenantStaffService.listForTenant(String(tenantId));
    return {
      status: true,
      message: 'OK',
      members: members.map((m) => ({
        tenantId: m.tenantId,
        userId: m.userId,
        role: m.role,
        tenantSlug: m.tenantSlug,
      })),
    };
  }

  async getTenantStaffMembership({
    tenantId,
    userId,
  }: GetTenantStaffMembershipRequest): Promise<GetTenantStaffMembershipResponse> {
    const membership = await this.tenantStaffService.findMembership(String(tenantId), String(userId));
    return {
      status: true,
      message: 'OK',
      isMember: !!membership,
      role: membership?.role ?? '',
    };
  }

  async addContact({
    tenantId,
    email,
    phone,
    name,
    surname,
    accessLevel,
  }: AddContactRequest): Promise<ContactEntryResponse> {
    const created = await this.contactService.createForTenant({
      tenantId: String(tenantId),
      email: email || null,
      phone: phone || null,
      name: String(name),
      surname: surname || null,
      accessLevel: parseAccessLevel(accessLevel),
    });
    return {
      status: true,
      message: 'Contact created',
      contact: {
        id: created.id,
        email: created.email ?? '',
        phone: created.phone ?? '',
        name: created.name,
        surname: created.surname ?? '',
        accessLevel: created.accessLevel,
      },
    };
  }

  async updateContact({ contactId, email, phone, name, surname }: UpdateContactRequest): Promise<ContactEntryResponse> {
    const updated = await this.contactService.update(String(contactId), {
      email: email || null,
      phone: phone || null,
      name: name || undefined,
      surname: surname || null,
    });
    if (!updated) return { status: false, message: 'Contact not found', contact: undefined };
    return {
      status: true,
      message: 'Contact updated',
      contact: {
        id: updated.id,
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        name: updated.name,
        surname: updated.surname ?? '',
        accessLevel: '',
      },
    };
  }

  async getTenantContacts({ tenantId }: GetTenantContactsRequest): Promise<GetTenantContactsResponse> {
    const contacts = await this.contactService.listForTenant(String(tenantId));
    return {
      status: true,
      message: 'OK',
      contacts: contacts.map((c) => ({
        id: c.id,
        email: c.email ?? '',
        phone: c.phone ?? '',
        name: c.name,
        surname: c.surname ?? '',
        accessLevel: c.accessLevel,
      })),
    };
  }

  async removeContactFromTenant({
    tenantId,
    contactId,
  }: RemoveContactFromTenantRequest): Promise<MutationResponse> {
    const removed = await this.contactService.removeFromTenant(String(tenantId), String(contactId));
    return { status: removed, message: removed ? 'Contact removed from tenant' : 'Membership not found' };
  }

  async updateCustomization({
    tenantId,
    customizationJson,
  }: UpdateCustomizationRequest): Promise<UpdateCustomizationResponse> {
    const patch = JSON.parse(String(customizationJson)) as Partial<CommunityCustomization>;
    await this.tenantDbService.updateCustomization(String(tenantId), patch);
    return { status: true, message: 'Customization updated successfully' };
  }

  async upsertPlatformCredentials({
    tenantId,
    platform,
    configJson,
  }: UpsertPlatformCredentialsRequest): Promise<UpsertPlatformCredentialsResponse> {
    const config = JSON.parse(String(configJson)) as Record<string, unknown>;
    await this.platformCredentialsService.upsert(String(tenantId), String(platform), config);
    return { status: true, message: 'Platform credentials upserted successfully' };
  }

  async getTenantCommandConfigs({
    tenantId,
  }: GetTenantCommandConfigsRequest): Promise<GetTenantCommandConfigsResponse> {
    const configs = await this.commandConfigService.findByTenant(String(tenantId));
    return {
      status: true,
      message: 'OK',
      configs: configs.map((c) => ({
        id: String(c.id),
        commandName: String(c.commandName),
        active: Boolean(c.active),
        parametersOverrideJson: c.parametersOverride ? JSON.stringify(c.parametersOverride) : '',
        userTypes: c.userTypes ?? [],
        actionsJson: c.actions ? JSON.stringify(c.actions) : '',
        descriptionI18nJson: c.descriptionI18n ? JSON.stringify(c.descriptionI18n) : '',
      })),
    };
  }

  async upsertTenantCommandConfig({
    tenantId,
    commandName,
    active,
    parametersOverrideJson,
    userTypes,
    actionsJson,
    descriptionI18nJson,
  }: UpsertTenantCommandConfigRequest): Promise<UpsertTenantCommandConfigResponse> {
    const override = parametersOverrideJson
      ? (JSON.parse(String(parametersOverrideJson)) as Record<string, boolean>)
      : null;
    const actions = actionsJson ? (JSON.parse(String(actionsJson)) as Record<string, boolean>) : null;
    const descriptionI18n = descriptionI18nJson
      ? (JSON.parse(String(descriptionI18nJson)) as Record<string, string>)
      : null;
    await this.commandConfigService.upsert(
      String(tenantId),
      String(commandName),
      Boolean(active),
      override,
      userTypes ?? [],
      actions,
      descriptionI18n,
    );
    return { status: true, message: 'Command config upserted successfully' };
  }

  async deleteTenantCommandConfig({
    tenantId,
    commandName,
  }: DeleteTenantCommandConfigRequest): Promise<DeleteTenantCommandConfigResponse> {
    await this.commandConfigService.delete(String(tenantId), String(commandName));
    return { status: true, message: 'Command config deleted successfully' };
  }

  async getPromptForContext({
    tenantId,
    commandId,
    userType,
  }: GetPromptForContextRequest): Promise<GetPromptForContextResponse> {
    const cmdId = commandId ? String(commandId) : null;
    const prompt = await this.promptOverrideService.findForContext(
      String(tenantId),
      cmdId,
      null,
      String(userType) as UserType,
    );
    return {
      status: true,
      message: prompt ? 'Prompt found' : 'Using default',
      prompt: prompt ?? '',
    };
  }

  async upsertTenantPromptOverride({
    tenantId,
    commandId,
    userType,
    prompt,
    descriptionI18nJson,
  }: UpsertTenantPromptOverrideRequest): Promise<UpsertTenantPromptOverrideResponse> {
    const descriptionI18n = descriptionI18nJson
      ? (JSON.parse(String(descriptionI18nJson)) as Record<string, string>)
      : null;
    await this.promptOverrideService.upsert(
      String(tenantId),
      commandId ? String(commandId) : null,
      String(userType) as UserType,
      String(prompt),
      descriptionI18n,
    );
    return { status: true, message: 'Prompt override upserted successfully' };
  }

  async getTenantPromptOverrides({
    tenantId,
  }: GetTenantPromptOverridesRequest): Promise<GetTenantPromptOverridesResponse> {
    const overrides = await this.promptOverrideService.findByTenant(String(tenantId));
    return {
      status: true,
      message: 'OK',
      overrides: overrides.map((o: TenantPromptOverride) => ({
        id: String(o.id),
        tenantId: String(o.tenantId),
        commandId: o.commandId ? String(o.commandId) : '',
        userType: String(o.userType),
        descriptionI18nJson: o.descriptionI18n ? JSON.stringify(o.descriptionI18n) : '',
        prompt: String(o.prompt),
      })),
    };
  }

  async getTenantUsage({ billingUserId }: GetTenantUsageRequest): Promise<GetTenantUsageResponse> {
    const report = await this.usageService.getForBillingUser(String(billingUserId));
    return {
      status: true,
      message: 'OK',
      tenants: report.tenants,
      perTenant: report.perTenant.map((e) => ({
        tenantId: e.tenantId,
        staff: e.staff,
        platforms: e.platforms,
        contacts: e.contacts,
        customCommands: e.customCommands,
      })),
    };
  }

  async transferTenantBilling({
    tenantId,
    newBillingUserId,
  }: TransferTenantBillingRequest): Promise<MutationResponse> {
    await this.tenantDbService.transferBilling(String(tenantId), String(newBillingUserId));
    return { status: true, message: 'Billing transferred' };
  }

  async setTenantActive({ tenantId, active }: SetTenantActiveRequest): Promise<MutationResponse> {
    await this.tenantDbService.setActive(String(tenantId), Boolean(active));
    return { status: true, message: active ? 'Tenant activated' : 'Tenant deactivated' };
  }

  async deleteTenant({ tenantId, slugConfirmation }: DeleteTenantRequest): Promise<MutationResponse> {
    await this.tenantDbService.hardDelete(String(tenantId), String(slugConfirmation));
    return { status: true, message: 'Tenant deleted' };
  }

  async recordAuditEntry(req: RecordAuditEntryRequest): Promise<MutationResponse> {
    let payload: Record<string, unknown> | null = null;
    if (req.payloadJson) {
      try {
        payload = JSON.parse(String(req.payloadJson)) as Record<string, unknown>;
      } catch {
        // ignore malformed payload — audit must never throw
      }
    }
    await this.auditService.record({
      tenantId: req.tenantId ? String(req.tenantId) : null,
      userId: String(req.userId),
      action: String(req.action),
      payload,
      ip: req.ip ? String(req.ip) : null,
      userAgent: req.userAgent ? String(req.userAgent) : null,
      correlationId: req.correlationId ? String(req.correlationId) : null,
    });
    return { status: true, message: 'OK' };
  }

  async getTenantAuditLog({
    tenantId,
    limit,
  }: GetTenantAuditLogRequest): Promise<GetTenantAuditLogResponse> {
    const items = await this.auditService.listForTenant(String(tenantId), limit && limit > 0 ? limit : 100);
    return {
      status: true,
      message: 'OK',
      entries: items.map((e) => ({
        id: e.id,
        tenantId: e.tenantId ?? '',
        userId: e.userId,
        action: e.action,
        payloadJson: e.payloadJson ? JSON.stringify(e.payloadJson) : '',
        correlationId: e.correlationId ?? '',
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }
}
