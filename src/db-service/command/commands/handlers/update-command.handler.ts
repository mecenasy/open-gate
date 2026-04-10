import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommandCommand } from '../impl/update-command.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(UpdateCommandCommand)
export class UpdateCommandHandler implements ICommandHandler<UpdateCommandCommand, CommandProto | null> {
  constructor(private readonly commandService: CommandService) {}

  async execute(command: UpdateCommandCommand): Promise<CommandProto | null> {
    const entity = await this.commandService.update(command.id, command.request);
    return entity ? this.commandService.entityToProto(entity) : null;
  }
}
