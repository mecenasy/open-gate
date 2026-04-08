import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from 'src/bff-service/common/handler/handler';
import { AddConfigCommand } from '../impl/add-config.command';
import { ConfigResponseType } from '../../dto/response.type';

@CommandHandler(AddConfigCommand)
export class AddConfigHandler extends Handler<AddConfigCommand, ConfigResponseType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute({ input }: AddConfigCommand): Promise<ConfigResponseType> {
    const response = await lastValueFrom(
      this.gRpcService.add({
        key: input.key,
        value: input.value,
        description: input.description,
      }),
    );

    if (!response || response.status === false || !response.data) {
      throw new BadRequestException(response?.message ?? "Sorry we can't add this config");
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
