import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
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

    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(UpdateUserRoleHandler.name);
  }

  async execute(command: UpdateUserRoleCommand): Promise<UserData | null> {
    this.logger.log('Executing UpdateUserRole');

    try {
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
    } catch (error) {
      this.logger.error('Error executing UpdateUserRole', error);
      throw error;
    }
  }
}
