import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { RemoveCommandCommand } from '../impl/remove-command.command';
import { CommandService } from '../../command.service';

@CommandHandler(RemoveCommandCommand)
export class RemoveCommandHandler extends BaseCommandHandler<RemoveCommandCommand, boolean> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: RemoveCommandCommand): Promise<boolean> {
    return this.run('RemoveCommand', () => this.commandService.remove(command.id));
  }
}
