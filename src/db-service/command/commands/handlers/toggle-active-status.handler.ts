import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ToggleActiveStatusCommand } from '../impl/toggle-active-status.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(ToggleActiveStatusCommand)
export class ToggleActiveStatusHandler extends BaseCommandHandler<ToggleActiveStatusCommand, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: ToggleActiveStatusCommand): Promise<CommandProto | null> {
    return this.run('ToggleActiveStatus', async () => {
      const entity = await this.commandService.toggleActiveStatus(command.id, command.active);
      return entity ? this.commandService.entityToProto(entity) : null;
    });
  }
}
