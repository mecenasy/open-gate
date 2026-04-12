import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserCommand } from '../impl/update-user.command';
import { User } from '../../entity/user.entity';
import { UserRole } from '../../entity/user-role.entity';
import { UserType } from '../../user-type';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserData | null> {
    const { type, status, ...updateData } = command.data;
    const dataToUpdate: Partial<User> = { ...updateData };

    if (type) {
      dataToUpdate.userRole = await this.userRoleRepository.findOneOrFail({
        where: {
          userType: type ? protoToJsUserType(type) : UserType.User,
        },
      });
    }

    if (status) {
      dataToUpdate.status = protoToUserStatus(status);
    }

    await this.userRepository.update(command.id, dataToUpdate);

    const entity = await this.userRepository.findOne({
      where: { id: command.id },
      relations: ['userRole'],
    });

    return entity ? entityToProto(entity) : null;
  }
}
