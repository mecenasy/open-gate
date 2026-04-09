import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { COMMAND_SERVICE_NAME, CommandResponse, CommandServiceClient } from 'src/proto/command';
import { Handler } from 'src/bff-service/common/handler/handler';
import { UpdateCommandCommand } from '../impl/update-command.command';
import { CommandResponseType } from '../../dto/response.type';

@CommandHandler(UpdateCommandCommand)
export class UpdateCommandHandler extends Handler<UpdateCommandCommand, CommandResponseType, CommandServiceClient> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ input }: UpdateCommandCommand): Promise<CommandResponseType> {
    const response = await lastValueFrom(
      this.gRpcService.updateCommand({
        id: input.id,
        description: input.description,
        active: input.active,
        actions: input.actions,
        parameters: input.parameters,
        roleNames: input.roleNames,
      }),
    );

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't update this command");
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
        roleNames: response.data.roleNames ?? [],
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
    }

    return {
      status: response.status,
      message: response.message,
      data,
    };
  }
}
