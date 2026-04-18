import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantCommandConfig } from '@app/entities';

@Injectable()
export class TenantCommandConfigService {
  constructor(
    @InjectRepository(TenantCommandConfig)
    private readonly repo: Repository<TenantCommandConfig>,
  ) {}

  async findByTenant(tenantId: string): Promise<TenantCommandConfig[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async isCommandActive(tenantId: string, commandName: string): Promise<boolean> {
    const cfg = await this.repo.findOne({ where: { tenantId, commandName } });
    if (!cfg) return true;
    return cfg.active;
  }

  async upsert(
    tenantId: string,
    commandName: string,
    active: boolean,
    parametersOverride: Record<string, boolean> | null,
    userTypes: string[],
    actions: Record<string, boolean> | null,
    descriptionI18n: Record<string, string> | null,
  ): Promise<void> {
    const existing = await this.repo.findOne({ where: { tenantId, commandName } });
    if (existing) {
      await this.repo.update(existing.id, { active, parametersOverride, userTypes, actions, descriptionI18n });
    } else {
      await this.repo.save(
        this.repo.create({ tenantId, commandName, active, parametersOverride, userTypes, actions, descriptionI18n }),
      );
    }
  }

  async delete(tenantId: string, commandName: string): Promise<void> {
    await this.repo.delete({ tenantId, commandName });
  }
}
