import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { UpdateUserStatusCommand } from '../impl/update-user-status.command';
import { User } from '../../entity/user.entity';
import { protoToUserStatus } from 'src/utils/concert-status';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler extends BaseCommandHandler<UpdateUserStatusCommand, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpdateUserStatusCommand): Promise<UserData | null> {
    return this.run('UpdateUserStatus', async () => {
      await this.userRepository.update(command.id, { status: protoToUserStatus(command.status) });
      const entity = await this.userRepository.findOne({
        where: { id: command.id },
        relations: ['userRole'],
      });
      return entity ? entityToProto(entity) : null;
    });
  }
}
