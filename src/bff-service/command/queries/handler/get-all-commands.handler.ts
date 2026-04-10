import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { Handler } from '@app/handler';
import { GetAllCommandsQuery } from '../impl/get-all-commands.query';
import { CommandsListType } from '../../dto/response.type';

@QueryHandler(GetAllCommandsQuery)
export class GetAllCommandsHandler extends Handler<GetAllCommandsQuery, CommandsListType, CommandServiceClient> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ page, limit, activeOnly, actionFilter = {} }: GetAllCommandsQuery): Promise<CommandsListType> {
    const response = await lastValueFrom(this.gRpcService.getAllCommands({ page, limit, activeOnly, actionFilter }));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get commands');
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        active: c.active,
        actions: c.actions,
        parameters: c.parameters,
        roleNames: c.roleNames ?? [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  }
}
