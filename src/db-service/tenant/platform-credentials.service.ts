import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformCredentials } from '@app/entities';

/** Sentinel UUID — global default platform credentials used as fallback for tenants without their own config. */
export const DEFAULT_PLATFORM_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class PlatformCredentialsService {
  constructor(
    @InjectRepository(PlatformCredentials)
    private readonly repo: Repository<PlatformCredentials>,
  ) {}

  async findByTenantAndPlatform(tenantId: string, platform: string): Promise<PlatformCredentials | null> {
    const specific = await this.repo.findOne({ where: { tenantId, platform, isActive: true } });
    if (specific) return specific;
    if (tenantId === DEFAULT_PLATFORM_FALLBACK_ID) return null;
    return this.repo.findOne({ where: { tenantId: DEFAULT_PLATFORM_FALLBACK_ID, platform, isActive: true } });
  }

  async findTenantsWithPlatform(platform: string): Promise<PlatformCredentials[]> {
    return this.repo.find({ where: { platform, isActive: true } });
  }

  async upsert(tenantId: string, platform: string, config: Record<string, unknown>): Promise<void> {
    const existing = await this.repo.findOne({ where: { tenantId, platform } });
    if (existing) {
      await this.repo.update(existing.id, { config, isActive: true });
    } else {
      await this.repo.save(this.repo.create({ tenantId, platform, config }));
    }
  }
}
