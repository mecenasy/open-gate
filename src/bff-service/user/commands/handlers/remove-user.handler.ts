import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from 'src/bff-service/common/handler/handler';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { SuccessResponseType } from '../../dto/response.type';

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler extends Handler<RemoveUserCommand, SuccessResponseType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ id }: RemoveUserCommand): Promise<SuccessResponseType> {
    const response = await lastValueFrom(this.gRpcService.removeUser({ id }));

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't remove this user");
    }

    await this.cache.removeFromCache({
      identifier: id,
      prefix: 'user',
    });

    return { success: true };
  }
}
