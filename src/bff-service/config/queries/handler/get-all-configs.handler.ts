import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from 'src/bff-service/common/handler/handler';
import { GetAllConfigsQuery } from '../impl/get-all-configs.query';
import { ConfigsListType } from '../../dto/response.type';

@QueryHandler(GetAllConfigsQuery)
export class GetAllConfigsHandler extends Handler<GetAllConfigsQuery, ConfigsListType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute(_query: GetAllConfigsQuery): Promise<ConfigsListType> {
    const response = await lastValueFrom(this.gRpcService.getAll({}));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get configs');
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data.map((c) => ({
        id: c.id,
        key: c.key,
        value: c.value,
        description: c.description,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }
}
