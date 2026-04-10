import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from '@app/handler';
import { GetFeaturesQuery } from '../impl/get-features.query';
import { ConfigsListType } from '../../dto/response.type';

@QueryHandler(GetFeaturesQuery)
export class GetFeaturesHandler extends Handler<GetFeaturesQuery, ConfigsListType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute(): Promise<ConfigsListType> {
    const response = await lastValueFrom(this.gRpcService.getFeatures({}));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get features');
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
