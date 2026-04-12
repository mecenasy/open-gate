import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { UpdateCommandCommand } from '../impl/update-command.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(UpdateCommandCommand)
export class UpdateCommandHandler implements ICommandHandler<UpdateCommandCommand, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(UpdateCommandHandler.name);
  }

  async execute(command: UpdateCommandCommand): Promise<CommandProto | null> {
    this.logger.log('Executing UpdateCommand');

    try {
      const entity = await this.commandService.update(command.id, command.request);
      return entity ? this.commandService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing UpdateCommand', error);
      throw error;
    }
  }
}
