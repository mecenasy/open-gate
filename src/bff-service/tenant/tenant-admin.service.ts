import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import type { CreateTenantResult, MutationResult, TenantType } from './dto/tenant-admin.types';
import type { TenantCommandConfigType, TenantPromptOverrideType } from './dto/tenant-admin.types';

@Injectable()
export class TenantAdminService implements OnModuleInit {
  private tenantGrpcService!: TenantServiceClient;

  constructor(@Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.tenantGrpcService = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  async createTenant(slug: string): Promise<CreateTenantResult> {
    const res = await lastValueFrom(this.tenantGrpcService.createTenant({ slug }));
    return { id: res.id, slug: res.slug, schemaName: res.schemaName };
  }

  async getAllTenants(): Promise<TenantType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getAllTenants({}));
    return res.tenants.map((t) => ({
      id: t.id,
      slug: t.slug,
      schemaName: t.schemaName,
      isActive: t.isActive,
    }));
  }

  async updateCustomization(tenantId: string, customizationJson: string): Promise<MutationResult> {
    const res = await lastValueFrom(this.tenantGrpcService.updateCustomization({ tenantId, customizationJson }));
    return { status: res.status, message: res.message };
  }

  async upsertPlatformCredentials(tenantId: string, platform: string, configJson: string): Promise<MutationResult> {
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertPlatformCredentials({ tenantId, platform, configJson }),
    );
    return { status: res.status, message: res.message };
  }

  async getTenantCommandConfigs(tenantId: string): Promise<TenantCommandConfigType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantCommandConfigs({ tenantId }));
    return res.configs.map((c) => ({
      id: c.id,
      commandId: c.commandId,
      commandName: c.commandName,
      active: c.active,
      parametersOverrideJson: c.parametersOverrideJson || undefined,
    }));
  }

  async upsertTenantCommandConfig(
    tenantId: string,
    commandId: string,
    active: boolean,
    parametersOverrideJson?: string,
  ): Promise<MutationResult> {
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertTenantCommandConfig({
        tenantId,
        commandId,
        active,
        parametersOverrideJson: parametersOverrideJson ?? '',
      }),
    );
    return { status: res.status, message: res.message };
  }

  async getTenantPromptOverrides(tenantId: string): Promise<TenantPromptOverrideType[]> {
    const res = await lastValueFrom(this.tenantGrpcService.getTenantPromptOverrides({ tenantId }));
    return res.overrides.map((o) => ({
      id: o.id,
      tenantId: o.tenantId,
      commandId: o.commandId || undefined,
      userType: o.userType,
      description: o.description || undefined,
      prompt: o.prompt,
    }));
  }

  async upsertTenantPromptOverride(
    tenantId: string,
    userType: string,
    prompt: string,
    commandId?: string,
    description?: string,
  ): Promise<MutationResult> {
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertTenantPromptOverride({
        tenantId,
        commandId: commandId ?? '',
        userType,
        prompt,
        description: description ?? '',
      }),
    );
    return { status: res.status, message: res.message };
  }
}
