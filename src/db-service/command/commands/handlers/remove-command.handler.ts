import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { RemoveCommandCommand } from '../impl/remove-command.command';
import { CommandService } from '../../command.service';

@CommandHandler(RemoveCommandCommand)
export class RemoveCommandHandler implements ICommandHandler<RemoveCommandCommand, boolean> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RemoveCommandHandler.name);
  }

  execute(command: RemoveCommandCommand): Promise<boolean> {
    this.logger.log('Executing RemoveCommand');

    try {
      return this.commandService.remove(command.id);
    } catch (error) {
      this.logger.error('Error executing RemoveCommand', error);
      throw error;
    }
  }
}
