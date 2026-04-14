import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformCredentials } from '@app/entities';

@Injectable()
export class PlatformCredentialsService {
  constructor(
    @InjectRepository(PlatformCredentials)
    private readonly repo: Repository<PlatformCredentials>,
  ) {}

  findByTenantAndPlatform(tenantId: string, platform: string): Promise<PlatformCredentials | null> {
    return this.repo.findOne({ where: { tenantId, platform, isActive: true } });
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
