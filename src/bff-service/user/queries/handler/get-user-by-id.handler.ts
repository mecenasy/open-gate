import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from '@app/handler';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { GetUserByIdQuery } from '../impl/get-user-by-id.query';
import { UserSummaryType } from '../../dto/response.type';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler extends Handler<GetUserByIdQuery, UserSummaryType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ id }: GetUserByIdQuery): Promise<UserSummaryType> {
    const cached = await this.cache.getFromCache<UserSummaryType>({
      identifier: id,
      prefix: 'user',
    });

    if (cached) {
      return cached;
    }

    const response = await lastValueFrom(this.gRpcService.getUser({ id }));

    if (!response || response.status === false || !response.data) {
      throw new NotFoundException(response?.message ?? 'User not found');
    }

    const user: UserSummaryType = {
      id: response.data.id,
      email: response.data.email,
      phone: response.data.phone,
      name: response.data.name,
      surname: response.data.surname,
      status: protoToUserStatus(response.data.status),
      type: protoToJsUserType(response.data.type),
    };

    await this.cache.saveInCache({
      identifier: id,
      data: user,
      EX: 3600,
      prefix: 'user',
    });

    return user;
  }
}
