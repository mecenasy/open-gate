import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveCommandCommand } from '../impl/remove-command.command';
import { CommandService } from '../../command.service';

@CommandHandler(RemoveCommandCommand)
export class RemoveCommandHandler implements ICommandHandler<RemoveCommandCommand, boolean> {
  constructor(private readonly commandService: CommandService) {}

  execute(command: RemoveCommandCommand): Promise<boolean> {
    return this.commandService.remove(command.id);
  }
}
