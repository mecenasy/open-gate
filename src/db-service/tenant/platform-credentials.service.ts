import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformCredentials } from '@app/entities';

/** Sentinel UUID — global default platform credentials used as fallback for tenants without their own config. */
export const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

const ALL_PLATFORMS = ['signal', 'sms', 'smtp', 'whatsapp', 'messenger'] as const;

@Injectable()
export class PlatformCredentialsService {
  constructor(
    @InjectRepository(PlatformCredentials)
    private readonly repo: Repository<PlatformCredentials>,
  ) {}

  async findByTenantAndPlatform(
    tenantId: string,
    platform: string,
  ): Promise<{ creds: PlatformCredentials; isDefault: boolean } | null> {
    const specific = await this.repo.findOne({ where: { tenantId, platform } });
    if (specific) return { creds: specific, isDefault: false };
    if (tenantId === DEFAULT_PLATFORM_FALLBACK_ID) return null;
    const fallback = await this.repo.findOne({ where: { tenantId: DEFAULT_PLATFORM_FALLBACK_ID, platform } });
    return fallback ? { creds: fallback, isDefault: true } : null;
  }

  async findAllForTenant(
    tenantId: string,
  ): Promise<Array<{ platform: string; config: Record<string, unknown>; isDefault: boolean }>> {
    const results: Array<{ platform: string; config: Record<string, unknown>; isDefault: boolean }> = [];
    for (const platform of ALL_PLATFORMS) {
      const found = await this.findByTenantAndPlatform(tenantId, platform);
      if (found) {
        results.push({ platform, config: found.creds.config as Record<string, unknown>, isDefault: found.isDefault });
      } else {
        results.push({ platform, config: {}, isDefault: true });
      }
    }
    return results;
  }

  async findTenantsWithPlatform(platform: string): Promise<PlatformCredentials[]> {
    return this.repo.find({ where: { platform, isActive: true } });
  }

  async upsert(tenantId: string, platform: string, config: Record<string, unknown>): Promise<void> {
    const existing = await this.repo.findOne({ where: { tenantId, platform } });
    if (existing) {
      existing.config = config;
      existing.isActive = true;
      await this.repo.save(existing);
    } else {
      await this.repo.save(this.repo.create({ tenantId, platform, config }));
    }
  }
}
