import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { Handler } from 'src/bff-service/common/handler/handler';
import { ToggleActiveStatusCommand } from '../impl/toggle-active-status.command';
import { CommandResponseType } from '../../dto/response.type';

@CommandHandler(ToggleActiveStatusCommand)
export class ToggleActiveStatusHandler extends Handler<
  ToggleActiveStatusCommand,
  CommandResponseType,
  CommandServiceClient
> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ input }: ToggleActiveStatusCommand): Promise<CommandResponseType> {
    const response = await lastValueFrom(this.gRpcService.toggleActiveStatus({ id: input.id, active: input.active }));

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't toggle command status");
    }

    let data: CommandResponse['data'] = undefined;
    if (response.data) {
      data = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        active: response.data.active,
        actions: response.data.actions,
        parameters: response.data.parameters,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }
    }

    return {
      status: response.status,
      message: response.message,
      data,
    };
  }
}
