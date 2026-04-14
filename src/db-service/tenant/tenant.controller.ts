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
  CreateTenantRequest,
  CreateTenantResponse,
  GetAllTenantsResponse,
  UpdateCustomizationRequest,
  UpdateCustomizationResponse,
  UpsertPlatformCredentialsRequest,
  UpsertPlatformCredentialsResponse,
  GetTenantCommandConfigsRequest,
  GetTenantCommandConfigsResponse,
  UpsertTenantCommandConfigRequest,
  UpsertTenantCommandConfigResponse,
  GetPromptForContextRequest,
  GetPromptForContextResponse,
  UpsertTenantPromptOverrideRequest,
  UpsertTenantPromptOverrideResponse,
  GetTenantPromptOverridesRequest,
  GetTenantPromptOverridesResponse,
} from 'src/proto/tenant';
import { TenantDbService } from './tenant.service';
import { PlatformCredentialsService } from './platform-credentials.service';
import { TenantCommandConfigService } from './tenant-command-config.service';
import { TenantPromptOverrideService } from './tenant-prompt-override.service';
import type { CommunityCustomization } from './entity/customization-config.entity';
import { TenantPromptOverride, UserType } from '@app/entities';

@Controller()
@TenantServiceControllerMethods()
export class TenantController implements TenantServiceController {
  constructor(
    private readonly tenantDbService: TenantDbService,
    private readonly platformCredentialsService: PlatformCredentialsService,
    private readonly commandConfigService: TenantCommandConfigService,
    private readonly promptOverrideService: TenantPromptOverrideService,
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
      return { status: false, message: 'Tenant not found', id: '', slug: '', schemaName: '', isActive: false };
    }
    return {
      status: true,
      message: 'Tenant retrieved successfully',
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
      isActive: tenant.isActive,
    };
  }

  async getPlatformCredentials({ tenantId, platform }: GetPlatformCredentialsRequest): Promise<GetPlatformCredentialsResponse> {
    const creds = await this.platformCredentialsService.findByTenantAndPlatform(tenantId, platform);
    if (!creds) {
      return { status: false, message: 'No credentials found', configJson: '' };
    }
    return {
      status: true,
      message: 'Credentials retrieved',
      configJson: JSON.stringify(creds.config),
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

  async createTenant({ slug }: CreateTenantRequest): Promise<CreateTenantResponse> {
    const tenant = await this.tenantDbService.create(String(slug));
    return {
      status: true,
      message: 'Tenant created successfully',
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
    };
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
      })),
    };
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
        commandId: String(c.commandId),
        commandName: String(c.commandName),
        active: Boolean(c.active),
        parametersOverrideJson: c.parametersOverride ? JSON.stringify(c.parametersOverride) : '',
      })),
    };
  }

  async upsertTenantCommandConfig({
    tenantId,
    commandId,
    active,
    parametersOverrideJson,
  }: UpsertTenantCommandConfigRequest): Promise<UpsertTenantCommandConfigResponse> {
    const override = parametersOverrideJson
      ? (JSON.parse(String(parametersOverrideJson)) as Record<string, boolean>)
      : null;
    await this.commandConfigService.upsert(String(tenantId), String(commandId), Boolean(active), override);
    return { status: true, message: 'Command config upserted successfully' };
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
    description,
  }: UpsertTenantPromptOverrideRequest): Promise<UpsertTenantPromptOverrideResponse> {
    await this.promptOverrideService.upsert(
      String(tenantId),
      commandId ? String(commandId) : null,
      String(userType) as UserType,
      String(prompt),
      description ? String(description) : null,
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
        description: o.description ? String(o.description) : '',
        prompt: String(o.prompt),
      })),
    };
  }
}
