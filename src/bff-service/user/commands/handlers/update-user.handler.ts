import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from 'src/bff-service/common/handler/handler';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { UpdateUserCommand } from '../impl/update-user.command';
import { UserSummaryType } from '../../dto/response.type';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler extends Handler<UpdateUserCommand, UserSummaryType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ user }: UpdateUserCommand): Promise<UserSummaryType> {
    const response = await lastValueFrom(
      this.gRpcService.updateUser({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        surname: user.surname,
      }),
    );

    if (!response || response.status === false || !response.data) {
      throw new BadRequestException(response?.message ?? "Sorry we can't update this user");
    }

    const result: UserSummaryType = {
      id: response.data.id,
      email: response.data.email,
      phone: response.data.phone,
      name: response.data.name,
      surname: response.data.surname,
      status: protoToUserStatus(response.data.status),
      type: protoToJsUserType(response.data.type),
    };

    await this.cache.updateInCache({
      identifier: result.id,
      data: result,
      EX: 3600,
      prefix: 'user',
    });

    return result;
  }
}
