import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { Handler } from '@app/handler';
import { GetAllByPermissionQuery } from '../impl/get-all-by-permission.query';
import { CommandsListType } from '../../dto/response.type';

@QueryHandler(GetAllByPermissionQuery)
export class GetAllByPermissionHandler extends Handler<
  GetAllByPermissionQuery,
  CommandsListType,
  CommandServiceClient
> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ input }: GetAllByPermissionQuery): Promise<CommandsListType> {
    const response = await lastValueFrom(
      this.gRpcService.getAllByPermission({
        roleName: input.roleName,
        page: input.page,
        limit: input.limit,
        activeOnly: input.activeOnly,
      }),
    );

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get commands by permission');
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
        roleNames: c.roleNames ?? [],
        parameters: c.parameters,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  }
}
