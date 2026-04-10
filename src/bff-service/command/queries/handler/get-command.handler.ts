import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { Handler } from 'src/bff-service/common/handler/handler';
import { GetCommandQuery } from '../impl/get-command.query';
import { CommandResponseType } from '../../dto/response.type';

@QueryHandler(GetCommandQuery)
export class GetCommandHandler extends Handler<GetCommandQuery, CommandResponseType, CommandServiceClient> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ input }: GetCommandQuery): Promise<CommandResponseType> {
    const response = await lastValueFrom(this.gRpcService.getCommand({ id: input.id, name: input.name }));

    if (!response || response.status === false || !response.data) {
      throw new NotFoundException(response?.message ?? 'Command not found');
    }

    return {
      status: response.status,
      message: response.message,
      data: {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        active: response.data.active,
        actions: response.data.actions,
        roleNames: response.data.roleNames ?? [],
        parameters: response.data.parameters,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      },
    };
  }
}
