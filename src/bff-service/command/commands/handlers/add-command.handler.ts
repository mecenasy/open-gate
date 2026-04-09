import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { COMMAND_SERVICE_NAME, CommandResponse, CommandServiceClient } from 'src/proto/command';
import { Handler } from 'src/bff-service/common/handler/handler';
import { AddCommandCommand } from '../impl/add-command.command';
import { CommandResponseType } from '../../dto/response.type';

@CommandHandler(AddCommandCommand)
export class AddCommandHandler extends Handler<AddCommandCommand, CommandResponseType, CommandServiceClient> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ input }: AddCommandCommand): Promise<CommandResponseType> {
    const response = await lastValueFrom(
      this.gRpcService.addCommand({
        name: input.name,
        description: input.description,
        actions: input.actions,
        parameters: input.parameters,
        roleNames: input.roleNames,
      }),
    );

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't add this command");
    }

    return this.mapResponse(response);
  }

  private mapResponse(response: CommandResponse): CommandResponseType {
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
