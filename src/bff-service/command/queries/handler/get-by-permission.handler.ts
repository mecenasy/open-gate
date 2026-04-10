import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { Handler } from 'src/bff-service/common/handler/handler';
import { GetByPermissionQuery } from '../impl/get-by-permission.query';
import { CommandResponseType } from '../../dto/response.type';

@QueryHandler(GetByPermissionQuery)
export class GetByPermissionHandler extends Handler<GetByPermissionQuery, CommandResponseType, CommandServiceClient> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ input }: GetByPermissionQuery): Promise<CommandResponseType> {
    const response = await lastValueFrom(
      this.gRpcService.getByPermission({
        roleName: input.roleName,
        id: input.id,
        name: input.name,
      }),
    );

    if (!response || response.status === false || !response.data) {
      throw new NotFoundException(response?.message ?? 'Command not found for this permission');
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
