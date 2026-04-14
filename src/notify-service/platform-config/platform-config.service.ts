import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { DbGrpcKey } from '@app/db-grpc';
import { CacheService } from '@app/redis';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import type { SignalConfig } from '../outgoing/platforms/signal/config/signal.config';
import type { SmsConfig } from '../outgoing/platforms/sms/config/sms.configs';
import type { SmtpConfig } from '../outgoing/platforms/smtp/config/smtp.configs';

/** Platform credential shapes */
export interface SignalCredentials {
  apiUrl: string;
  account: string;
}

export interface SmsCredentials {
  sid: string;
  token: string;
  phone: string;
}

export interface SmtpCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export interface WhatsAppCredentials {
  phoneNumberId: string;
  accessToken: string;
}

export interface MessengerCredentials {
  pageAccessToken: string;
  pageId: string;
}

export type PlatformCredentialMap = {
  signal: SignalCredentials;
  sms: SmsCredentials;
  smtp: SmtpCredentials;
  whatsapp: WhatsAppCredentials;
  messenger: MessengerCredentials;
};

const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes

@Injectable()
export class PlatformConfigService implements OnModuleInit {
  private readonly logger = new Logger(PlatformConfigService.name);
  private tenantGrpcService!: TenantServiceClient;

  constructor(
    @Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc,
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.tenantGrpcService = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  /**
   * Fetch platform credentials for a tenant.
   * Priority: Redis → gRPC (DB) → env vars fallback
   */
  async getConfig<P extends keyof PlatformCredentialMap>(
    tenantId: string,
    platform: P,
  ): Promise<PlatformCredentialMap[P] | null> {
    const cacheKey = `platform:${platform}:${tenantId}`;

    // 1. Redis cache
    try {
      const cached = await this.cache.getFromCache<PlatformCredentialMap[P]>({
        identifier: cacheKey,
        prefix: 'platform-config',
      });
      if (cached) return cached;
    } catch {
      this.logger.warn(`Redis unavailable for platform config [${platform}/${tenantId}]`);
    }

    // 2. gRPC → DB
    try {
      const response = await lastValueFrom(
        this.tenantGrpcService.getPlatformCredentials({ tenantId, platform }),
      );
      if (response.status && response.configJson) {
        const config = JSON.parse(response.configJson) as PlatformCredentialMap[P];
        await this.cache.saveInCache({ identifier: cacheKey, prefix: 'platform-config', data: config, EX: CACHE_TTL_SECONDS });
        return config;
      }
    } catch (err) {
      this.logger.warn(`gRPC failed for platform config [${platform}/${tenantId}]: ${String(err)}`);
    }

    // 3. Env var fallback
    return this.envFallback(platform) as PlatformCredentialMap[P] | null;
  }

  /**
   * Load all tenants that have credentials configured for a given platform.
   * Used by SignalBridgeManager at startup to open per-tenant WS connections.
   */
  async getTenantsWithPlatform<P extends keyof PlatformCredentialMap>(
    platform: P,
  ): Promise<Array<{ tenantId: string; config: PlatformCredentialMap[P] }>> {
    try {
      const response = await lastValueFrom(
        this.tenantGrpcService.getTenantsWithPlatform({ platform }),
      );
      if (!response.status) return [];
      return response.entries
        .map((e) => {
          try {
            return { tenantId: e.tenantId, config: JSON.parse(e.configJson) as PlatformCredentialMap[P] };
          } catch {
            return null;
          }
        })
        .filter((e): e is { tenantId: string; config: PlatformCredentialMap[P] } => e !== null);
    } catch (err) {
      this.logger.warn(`getTenantsWithPlatform failed [${platform}]: ${String(err)}`);
      return [];
    }
  }

  invalidate(tenantId: string, platform: keyof PlatformCredentialMap): void {
    const cacheKey = `platform:${platform}:${tenantId}`;
    void this.cache.removeFromCache({ identifier: cacheKey, prefix: 'platform-config' });
  }

  envFallback(platform: string): SignalCredentials | SmsCredentials | SmtpCredentials | null {
    switch (platform) {
      case 'signal':
        return this.configService.get<SignalConfig>('signal') ?? null;
      case 'sms':
        return this.configService.get<SmsConfig>('sms') ?? null;
      case 'smtp': {
        const smtp = this.configService.get<SmtpConfig>('smtp');
        if (!smtp) return null;
        return { ...smtp, port: smtp.port ?? 465 };
      }
      default:
        return null;
    }
  }
}
