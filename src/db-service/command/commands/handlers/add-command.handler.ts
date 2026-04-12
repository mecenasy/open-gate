import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { AddCommandCommand } from '../impl/add-command.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(AddCommandCommand)
export class AddCommandHandler implements ICommandHandler<AddCommandCommand, CommandProto> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(AddCommandHandler.name);
  }

  async execute(command: AddCommandCommand): Promise<CommandProto> {
    this.logger.log('Executing AddCommandCommand');
    try {
      const entity = await this.commandService.create(command.request);
      const result = this.commandService.entityToProto(entity);
      this.logger.log('Command added successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to add command', error);
      throw error;
    }
  }
}
