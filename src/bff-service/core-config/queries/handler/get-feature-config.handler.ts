import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from '@app/handler';
import { GetFeatureConfigQuery } from '../impl/get-feature-config.query';
import { ConfigsListType } from '../../dto/response.type';

@QueryHandler(GetFeatureConfigQuery)
export class GetFeatureConfigHandler extends Handler<GetFeatureConfigQuery, ConfigsListType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute({ key }: GetFeatureConfigQuery): Promise<ConfigsListType> {
    const response = await lastValueFrom(this.gRpcService.getFeatureConfig({ key }));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get feature config');
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data.map((config) => ({
        id: config.id,
        key: config.key,
        value: config.value,
        description: config.description,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      })),
    };
  }
}
