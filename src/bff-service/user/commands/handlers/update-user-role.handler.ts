import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from '@app/handler';
import { jsToProtoUserType, protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { UpdateUserRoleCommand } from '../impl/update-user-role.command';
import { UserSummaryType } from '../../dto/response.type';

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler extends Handler<UpdateUserRoleCommand, UserSummaryType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ input }: UpdateUserRoleCommand): Promise<UserSummaryType> {
    const response = await lastValueFrom(
      this.gRpcService.updateUserRole({
        id: input.id,
        type: jsToProtoUserType(input.type),
      }),
    );

    if (!response || response.status === false || !response.data) {
      throw new BadRequestException(response?.message ?? "Sorry we can't update user role");
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
