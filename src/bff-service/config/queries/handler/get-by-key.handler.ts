import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from 'src/bff-service/common/handler/handler';
import { GetByKeyQuery } from '../impl/get-by-key.query';
import { ConfigResponseType } from '../../dto/response.type';

@QueryHandler(GetByKeyQuery)
export class GetByKeyHandler extends Handler<GetByKeyQuery, ConfigResponseType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute({ key }: GetByKeyQuery): Promise<ConfigResponseType> {
    const response = await lastValueFrom(this.gRpcService.getByKey({ key }));

    if (!response || response.status === false || !response.data) {
      throw new NotFoundException(response?.message ?? 'Config not found');
    }

    return {
      status: response.status,
      message: response.message,
      data: {
        id: response.data.id,
        key: response.data.key,
        value: response.data.value,
        description: response.data.description,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      },
    };
  }
}
