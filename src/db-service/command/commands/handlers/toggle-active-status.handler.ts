import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ToggleActiveStatusCommand } from '../impl/toggle-active-status.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(ToggleActiveStatusCommand)
export class ToggleActiveStatusHandler implements ICommandHandler<ToggleActiveStatusCommand, CommandProto | null> {
  constructor(private readonly commandService: CommandService) {}

  async execute(command: ToggleActiveStatusCommand): Promise<CommandProto | null> {
    const entity = await this.commandService.toggleActiveStatus(command.id, command.active);
    return entity ? this.commandService.entityToProto(entity) : null;
  }
}
