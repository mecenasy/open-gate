import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from 'src/bff-service/common/handler/handler';
import { GetCoreAllQuery } from '../impl/get-core-all.query';
import { ConfigsListType } from '../../dto/response.type';

@QueryHandler(GetCoreAllQuery)
export class GetCoreAllHandler extends Handler<GetCoreAllQuery, ConfigsListType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute(): Promise<ConfigsListType> {
    const response = await lastValueFrom(this.gRpcService.getCoreAll({}));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get core configs');
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
