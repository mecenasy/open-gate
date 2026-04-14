import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantCommandConfig } from '@app/entities';
import { Command } from '../command/entity/command.entity';

export interface CommandConfigWithName extends TenantCommandConfig {
  commandName: string;
}

@Injectable()
export class TenantCommandConfigService {
  constructor(
    @InjectRepository(TenantCommandConfig)
    private readonly repo: Repository<TenantCommandConfig>,
    @InjectRepository(Command)
    private readonly commandRepo: Repository<Command>,
  ) {}

  async findByTenant(tenantId: string): Promise<CommandConfigWithName[]> {
    const configs = await this.repo.find({ where: { tenantId } });
    const commandIds = configs.map((c) => c.commandId);
    if (commandIds.length === 0) return [];

    const commands = await this.commandRepo.findByIds(commandIds);
    const commandMap = new Map(commands.map((c) => [c.id, c.name]));

    return configs.map((cfg) => ({
      ...cfg,
      commandName: commandMap.get(cfg.commandId) ?? '',
    }));
  }

  async isCommandActive(tenantId: string, commandId: string): Promise<boolean> {
    const cfg = await this.repo.findOne({ where: { tenantId, commandId } });
    // no config entry = inherit global command active flag
    if (!cfg) return true;
    return cfg.active;
  }

  async upsert(
    tenantId: string,
    commandId: string,
    active: boolean,
    parametersOverride: Record<string, boolean> | null,
  ): Promise<void> {
    const existing = await this.repo.findOne({ where: { tenantId, commandId } });
    if (existing) {
      await this.repo.update(existing.id, { active, parametersOverride });
    } else {
      await this.repo.save(this.repo.create({ tenantId, commandId, active, parametersOverride }));
    }
  }
}
