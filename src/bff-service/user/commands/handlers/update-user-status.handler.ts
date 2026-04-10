import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from '@app/handler';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus, userStatusToProto } from 'src/utils/concert-status';
import { UpdateUserStatusCommand } from '../impl/update-user-status.command';
import { UserSummaryType } from '../../dto/response.type';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler extends Handler<UpdateUserStatusCommand, UserSummaryType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ input }: UpdateUserStatusCommand): Promise<UserSummaryType> {
    const response = await lastValueFrom(
      this.gRpcService.updateUserStatus({
        id: input.id,
        status: userStatusToProto(input.status),
      }),
    );

    if (!response || response.status === false || !response.data) {
      throw new BadRequestException(response?.message ?? "Sorry we can't update user status");
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
