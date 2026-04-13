import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { TenantService } from '@app/tenant';
import { CommunityCustomization, DEFAULT_CUSTOMIZATION } from '@app/customization';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';

interface CacheEntry {
  data: CommunityCustomization;
  expiresAt: number;
}

@Injectable()
export class TenantCustomizationService implements OnModuleInit {
  private tenantGrpcService!: TenantServiceClient;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs = 5 * 60 * 1000;

  @Inject(DbGrpcKey)
  private readonly grpcClient!: ClientGrpc;

  constructor(private readonly tenantService: TenantService) {}

  onModuleInit() {
    this.tenantGrpcService = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  async getForTenant(tenantId: string): Promise<CommunityCustomization> {
    const cached = this.cache.get(tenantId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const response = await lastValueFrom(this.tenantGrpcService.getCustomization({ tenantId }));
      if (!response.status || !response.customizationJson) {
        return DEFAULT_CUSTOMIZATION;
      }
      const data = JSON.parse(response.customizationJson) as CommunityCustomization;
      this.cache.set(tenantId, { data, expiresAt: Date.now() + this.ttlMs });
      return data;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  }

  async getForCurrentTenant(): Promise<CommunityCustomization> {
    const ctx = this.tenantService.getContext();
    if (!ctx) {
      return DEFAULT_CUSTOMIZATION;
    }
    return this.getForTenant(ctx.tenantId);
  }

  invalidate(tenantId: string): void {
    this.cache.delete(tenantId);
  }
}
