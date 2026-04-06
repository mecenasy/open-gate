import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../common/entity/config.entity';
import { AddConfigRequest, RemoveConfigRequest, GetByKeyRequest, Config as ConfigProto } from 'src/proto/config';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  async add(request: AddConfigRequest): Promise<Config> {
    const newConfig = this.configRepository.create({
      key: request.key,
      value: request.value,
      description: request.description,
    });
    return await this.configRepository.save(newConfig);
  }

  async remove(request: RemoveConfigRequest): Promise<boolean> {
    const result = await this.configRepository.delete({ key: request.key });
    return (result.affected || 0) > 0;
  }

  async getByKey(request: GetByKeyRequest): Promise<Config | null> {
    return await this.configRepository.findOne({ where: { key: request.key } });
  }

  async getAll(): Promise<Config[]> {
    return await this.configRepository.find();
  }

  async update(key: string, value: string, description?: string): Promise<Config | null> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) {
      return null;
    }

    config.value = value;
    if (description !== undefined) {
      config.description = description;
    }

    return await this.configRepository.save(config);
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
