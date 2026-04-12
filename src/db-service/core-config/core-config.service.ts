import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Config } from './entity/config.entity';
import { Config as ConfigProto } from '../../proto/config';
import { ConfigType } from './entity/types';
import { configMaps } from './modules-maps/config-maps';

@Injectable()
export class CoreConfigService {
  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  async getAllCoreConfigs(): Promise<Config[]> {
    return this.configRepository.find({
      order: { key: 'ASC' },
      where: { configType: ConfigType.Core },
    });
  }

  fetchAllFeatures(): Promise<Config[]> {
    return this.configRepository.find({
      order: { key: 'ASC' },
      where: {
        key: In(configMaps['feature']),
        value: 'true',
      },
    });
  }

  async getConfigsByFeatureKey(key: string): Promise<Config[]> {
    const keys = (configMaps as Record<string, string[]>)[key] ?? [];
    return this.configRepository.find({
      order: { key: 'ASC' },
      where: { key: In(keys) },
    });
  }

  async updateConfig(key: string, value: string): Promise<Config> {
    await this.configRepository.upsert({ key, value }, { conflictPaths: ['key'], skipUpdateIfNoValuesChanged: true });
    return this.configRepository.findOneOrFail({ where: { key } });
  }
  // Helper method to convert entity to proto
  entityToProto(config: Config): ConfigProto {
    return {
      id: config.key, // Use key as id since entity doesn't have id field
      key: config.key,
      value: config.value,
      description: config.description || '',
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }
}
