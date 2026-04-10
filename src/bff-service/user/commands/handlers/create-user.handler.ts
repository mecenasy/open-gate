import { CommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from '@app/handler';
import { jsToProtoUserType } from 'src/utils/user-type-converter';
import { UserType } from '../../dto/user.type.';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler extends Handler<CreateUserCommand, UserType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute(command: CreateUserCommand): Promise<UserType> {
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

    if (!user || user.status === false) {
      throw new BadRequestException("Sorry we con't create this account");
    }

    await this.cache.saveInCache({
      identifier: user.data?.id ?? '',
      data: user,
      EX: 3600,
      prefix: 'user',
    });

    return {
      id: user.data?.id ?? '',
      email: user.data?.email ?? '',
    };
  }
}
