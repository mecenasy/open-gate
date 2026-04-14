import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import type { CreateTenantResult, MutationResult, TenantType } from './dto/tenant-admin.types';

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
    const res = await lastValueFrom(
      this.tenantGrpcService.updateCustomization({ tenantId, customizationJson }),
    );
    return { status: res.status, message: res.message };
  }

  async upsertPlatformCredentials(
    tenantId: string,
    platform: string,
    configJson: string,
  ): Promise<MutationResult> {
    const res = await lastValueFrom(
      this.tenantGrpcService.upsertPlatformCredentials({ tenantId, platform, configJson }),
    );
    return { status: res.status, message: res.message };
  }
}
