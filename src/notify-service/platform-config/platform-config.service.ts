import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
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

/**
 * Raw SMS credentials as stored in platform_credentials.config.
 *
 * Three valid shapes share this interface, distinguished by `provider`:
 *
 *   - undefined / 'twilio' — self-hosted: tenant carries their own Twilio
 *     account, sid/token/phone all on the tenant row.
 *   - 'managed' — tenant uses the master Twilio account; only `phone` is on
 *     the tenant row, sid/token come from the sentinel-UUID master row.
 *   - master row at DEFAULT_PLATFORM_FALLBACK_ID — always 'twilio' with
 *     full sid/token; phone is informational, may be empty.
 *
 * Use `resolveSmsCredentials(tenantId)` rather than reading sid/token off
 * this type directly — the resolver enforces the merge between managed
 * tenant rows and the master row.
 */
export interface SmsCredentials {
  provider?: 'twilio' | 'managed';
  sid?: string;
  token?: string;
  phone: string;
  /** Country → regulatory bundle ID. Only the master row carries this. */
  bundleSidByCountry?: Record<string, string>;
  /**
   * Country → Twilio Address SID. Required by Twilio for PL (and similar
   * regulated regions) when calling incomingPhoneNumbers.create — the
   * regulatory bundle alone isn't enough. Master row only.
   */
  addressSidByCountry?: Record<string, string>;
}

/**
 * SMS credentials with sid/token guaranteed present — what callers actually
 * need to send a message. Produced by `resolveSmsCredentials`.
 */
export interface ResolvedSmsCredentials {
  provider: 'twilio' | 'managed';
  sid: string;
  token: string;
  phone: string;
  bundleSidByCountry?: Record<string, string>;
  addressSidByCountry?: Record<string, string>;
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

/** Sentinel UUID — global default platform credentials used as fallback for tenants without their own config. */
export const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

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
      const response = await lastValueFrom(this.tenantGrpcService.getPlatformCredentials({ tenantId, platform }));
      if (response.status && response.configJson) {
        const config = JSON.parse(response.configJson) as PlatformCredentialMap[P];
        await this.cache.saveInCache({
          identifier: cacheKey,
          prefix: 'platform-config',
          data: config,
          EX: CACHE_TTL_SECONDS,
        });
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
      const response = await lastValueFrom(this.tenantGrpcService.getTenantsWithPlatform({ platform }));
      if (!response.status) return [];
      return (response.entries ?? [])
        .map((e) => {
          try {
            return { tenantId: e.tenantId, config: JSON.parse(e.configJson) as PlatformCredentialMap[P] };
          } catch {
            return null;
          }
        })
        .filter((e): e is { tenantId: string; config: PlatformCredentialMap[P] } => e !== null);
    } catch (err) {
      this.logger.warn(
        `getTenantsWithPlatform failed [${platform}]: ${err instanceof Error ? err.stack : String(err)}`,
      );
      return [];
    }
  }

  /**
   * Resolves SMS credentials usable for actually sending a message.
   *
   * For `provider: 'managed'` rows, the tenant row only carries `phone` —
   * sid/token are pulled from the master row at DEFAULT_PLATFORM_FALLBACK_ID.
   * For self-hosted ('twilio' or undefined) rows, the tenant config is
   * returned as-is provided sid/token are present.
   *
   * Returns null when required fields are missing (e.g. master row missing
   * sid/token, or tenant managed row without master configured) — the
   * caller is expected to log + skip rather than throw.
   */
  async resolveSmsCredentials(tenantId: string): Promise<ResolvedSmsCredentials | null> {
    const cfg = await this.getConfig(tenantId, 'sms');
    if (!cfg) return null;

    if (cfg.provider === 'managed') {
      // Managed: merge master sid/token with tenant phone. Don't trust the
      // tenant row's provider tag without verifying the master row exists.
      if (tenantId === DEFAULT_PLATFORM_FALLBACK_ID) {
        this.logger.warn('SMS master row marked provider=managed; treating as misconfigured.');
        return null;
      }
      const master = await this.getConfig(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
      if (!master?.sid || !master.token) {
        this.logger.warn(`Managed SMS for tenant ${tenantId} but master row has no sid/token.`);
        return null;
      }
      if (!cfg.phone) {
        this.logger.warn(`Managed SMS for tenant ${tenantId} but tenant row has no phone.`);
        return null;
      }
      return {
        provider: 'managed',
        sid: master.sid,
        token: master.token,
        phone: cfg.phone,
        bundleSidByCountry: master.bundleSidByCountry,
        addressSidByCountry: master.addressSidByCountry,
      };
    }

    if (!cfg.sid || !cfg.token || !cfg.phone) {
      this.logger.warn(`Self-hosted SMS for tenant ${tenantId} missing sid/token/phone.`);
      return null;
    }
    return {
      provider: 'twilio',
      sid: cfg.sid,
      token: cfg.token,
      phone: cfg.phone,
      bundleSidByCountry: cfg.bundleSidByCountry,
      addressSidByCountry: cfg.addressSidByCountry,
    };
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
