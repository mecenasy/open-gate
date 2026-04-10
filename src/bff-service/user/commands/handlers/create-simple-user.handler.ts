import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { Handler } from '@app/handler';
import { jsToProtoUserType } from 'src/utils/user-type-converter';
import { UserType } from '../../dto/user.type.';
import { CreateSimpleUserCommand } from '../impl/create-simple-user.command';
import { userStatusToProto } from 'src/utils/concert-status';

@CommandHandler(CreateSimpleUserCommand)
export class CreateUserSimpleHandler extends Handler<CreateSimpleUserCommand, UserType, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute(command: CreateSimpleUserCommand): Promise<UserType> {
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
        status: userStatusToProto(userToCreate.status),
        phoneOwner: userToCreate.phoneOwner,
        type: jsToProtoUserType(userToCreate.type),
      }),
    );

    if (!user || user.status === false) {
      throw new BadRequestException("Sorry we con't create this account");
    }

    return {
      id: user.data?.id ?? '',
      email: user.data?.email ?? '',
    };
  }
}
