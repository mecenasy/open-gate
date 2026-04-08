import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from 'src/bff-service/common/handler/handler';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { UsersListType } from '../../dto/response.type';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler extends Handler<GetAllUsersQuery, UsersListType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ page, limit }: GetAllUsersQuery): Promise<UsersListType> {
    const response = await lastValueFrom(this.gRpcService.getAllUsers({ page, limit }));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get users');
    }

    return {
      users: response.data.map((user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        surname: user.surname,
        status: protoToUserStatus(user.status),
        type: protoToJsUserType(user.type),
      })),
      total: response.total,
    };
  }
}
