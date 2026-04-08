import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CONFIG_SERVICE_NAME, ConfigServiceClient } from 'src/proto/config';
import { Handler } from 'src/bff-service/common/handler/handler';
import { RemoveConfigCommand } from '../impl/remove-config.command';
import { ConfigSuccessType } from '../../dto/response.type';

@CommandHandler(RemoveConfigCommand)
export class RemoveConfigHandler extends Handler<RemoveConfigCommand, ConfigSuccessType, ConfigServiceClient> {
  constructor() {
    super(CONFIG_SERVICE_NAME);
  }

  async execute({ key }: RemoveConfigCommand): Promise<ConfigSuccessType> {
    const response = await lastValueFrom(this.gRpcService.remove({ key }));

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't remove this config");
    }

    return { success: true };
  }
}
