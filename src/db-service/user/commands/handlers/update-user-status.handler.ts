import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserStatusCommand } from '../impl/update-user-status.command';
import { User } from '../../entity/user.entity';
import { protoToUserStatus } from 'src/utils/concert-status';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler implements ICommandHandler<UpdateUserStatusCommand, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: UpdateUserStatusCommand): Promise<UserData | null> {
    await this.userRepository.update(command.id, { status: protoToUserStatus(command.status) });

    const entity = await this.userRepository.findOne({
      where: { id: command.id },
      relations: ['userRole'],
    });

    return entity ? entityToProto(entity) : null;
  }
}
