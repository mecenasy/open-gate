import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from '@app/handler';
import { UpdateConfigCommand } from '../impl/update-config.command';
import { ConfigResponseType } from '../../dto/response.type';

@CommandHandler(UpdateConfigCommand)
export class UpdateConfigHandler extends Handler<UpdateConfigCommand, ConfigResponseType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute({ input }: UpdateConfigCommand): Promise<ConfigResponseType> {
    const response = await lastValueFrom(
      this.gRpcService.updateConfig({
        key: input.key,
        value: input.value,
      }),
    );

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't update this config");
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data
        ? {
          id: response.data.id,
          key: response.data.key,
          value: response.data.value,
          description: response.data.description,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        }
        : undefined,
    };
  }
}
