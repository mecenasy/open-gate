import { CommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient, UserResponse } from 'src/proto/user';
import { Handler } from 'src/bff-service/common/handler/handler';
import { jsToProtoUserType } from 'src/utils/user-type-converter';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler extends Handler<CreateUserCommand, UserResponse, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute(command: CreateUserCommand) {
    const { user: userToCreate } = command;
    this.logger.log(userToCreate);
    const { exist } = await lastValueFrom(this.gRpcService.checkExist(userToCreate));

    if (exist) {
      throw new BadRequestException("Sorry we con't create this account");
    }

    const user = await lastValueFrom(
      this.gRpcService.addUser({
        email: userToCreate.email,
        phone: userToCreate.phone,
        name: userToCreate.name,
        surname: userToCreate.surname,
        type: jsToProtoUserType(userToCreate.type as any),
      }),
    );

    await this.cache.saveInCache({
      identifier: user.data?.id ?? '',
      data: user,
      EX: 3600,
      prefix: 'user',
    });

    return user;
  }
}
