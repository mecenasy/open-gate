import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { ToggleActiveStatusCommand } from '../impl/toggle-active-status.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(ToggleActiveStatusCommand)
export class ToggleActiveStatusHandler implements ICommandHandler<ToggleActiveStatusCommand, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(ToggleActiveStatusHandler.name);
  }

  async execute(command: ToggleActiveStatusCommand): Promise<CommandProto | null> {
    this.logger.log('Executing ToggleActiveStatus');

    try {
      const entity = await this.commandService.toggleActiveStatus(command.id, command.active);
      return entity ? this.commandService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing ToggleActiveStatus', error);
      throw error;
    }
  }
}
