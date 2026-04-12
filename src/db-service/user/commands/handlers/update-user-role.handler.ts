import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserRoleCommand } from '../impl/update-user-role.command';
import { User } from '../../entity/user.entity';
import { UserRole } from '../../entity/user-role.entity';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async execute(command: UpdateUserRoleCommand): Promise<UserData | null> {
    const userRole = await this.userRoleRepository.findOneOrFail({
      where: {
        userType: protoToJsUserType(command.type),
      },
    });

    const user = await this.userRepository.findOne({
      where: { id: command.id },
      relations: ['userRole'],
    });

    if (!user) {
      return null;
    }

    user.userRole = userRole;
    await this.userRepository.save(user);

    const updated = await this.userRepository.findOne({
      where: { id: command.id },
      relations: ['userRole'],
    });

    return updated ? entityToProto(updated) : null;
  }
}
