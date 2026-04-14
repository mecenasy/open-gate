import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TenantPromptOverride } from '@app/entities';
import { UserType } from '@app/entities';
import { Prompt } from '../prompt/entity/prompt.entity';

@Injectable()
export class TenantPromptOverrideService {
  constructor(
    @InjectRepository(TenantPromptOverride)
    private readonly overrideRepo: Repository<TenantPromptOverride>,
    @InjectRepository(Prompt)
    private readonly promptRepo: Repository<Prompt>,
  ) {}

  /**
   * Priority chain (most specific first):
   *  1. tenant + command + userType
   *  2. tenant + null    + userType
   *  3. global prompts table — commandName match + userType
   *  4. global prompts table — userType only (first match)
   */
  async findForContext(
    tenantId: string,
    commandId: string | null,
    commandName: string | null,
    userType: UserType,
  ): Promise<string | null> {
    if (commandId) {
      const specific = await this.overrideRepo.findOne({
        where: { tenantId, commandId, userType },
      });
      if (specific) return specific.prompt;
    }

    const general = await this.overrideRepo.findOne({
      where: { tenantId, commandId: IsNull(), userType },
    });
    if (general) return general.prompt;

    if (commandName) {
      const globalCmd = await this.promptRepo.findOne({
        where: { commandName, userType },
      });
      if (globalCmd) return globalCmd.prompt;
    }

    const globalFallback = await this.promptRepo.findOne({
      where: { userType },
    });
    if (globalFallback) return globalFallback.prompt;

    return null;
  }

  async findByTenant(tenantId: string): Promise<TenantPromptOverride[]> {
    return this.overrideRepo.find({ where: { tenantId } });
  }

  async upsert(
    tenantId: string,
    commandId: string | null,
    userType: UserType,
    prompt: string,
    description: string | null,
  ): Promise<void> {
    const existing = await this.overrideRepo.findOne({
      where: { tenantId, commandId: commandId ?? IsNull(), userType },
    });
    if (existing) {
      await this.overrideRepo.update(existing.id, { prompt, description });
    } else {
      await this.overrideRepo.save(
        this.overrideRepo.create({ tenantId, commandId, userType, prompt, description }),
      );
    }
  }
}
