import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { DbGrpcKey } from '@app/db-grpc';
import { BindingPlatform } from '@app/entities';
import {
  PLATFORM_IDENTITY_DB_SERVICE_NAME,
  type PlatformIdentityDbServiceClient,
  type ResolvePhoneResponse,
  type PlatformIdentityEntry,
} from 'src/proto/platform-identity';

/**
 * Thin RxJS-to-Promise wrapper over the platform-identity db gRPC service.
 *
 * Hot path: resolvePhoneByPlatformUserId is called from SignalTransformer
 * on every incoming Signal message (UUID → phone translation so the
 * existing core-service identity flow keeps working).
 */
@Injectable()
export class PlatformIdentityDbClient implements OnModuleInit {
  private readonly logger = new Logger(PlatformIdentityDbClient.name);
  private client!: PlatformIdentityDbServiceClient;

  constructor(@Inject(DbGrpcKey) private readonly grpc: ClientGrpc) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<PlatformIdentityDbServiceClient>(PLATFORM_IDENTITY_DB_SERVICE_NAME);
  }

  async resolvePhoneByPlatformUserId(
    tenantId: string,
    platform: BindingPlatform,
    platformUserId: string,
  ): Promise<ResolvePhoneResponse> {
    return firstValueFrom(this.client.resolvePhoneByPlatformUserId({ tenantId, platform, platformUserId }));
  }

  async findByPlatformUserId(
    tenantId: string,
    platform: BindingPlatform,
    platformUserId: string,
  ): Promise<PlatformIdentityEntry | null> {
    const res = await firstValueFrom(this.client.findByPlatformUserId({ tenantId, platform, platformUserId }));
    return res.status && res.data ? res.data : null;
  }
}
