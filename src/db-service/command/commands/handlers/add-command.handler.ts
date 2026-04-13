import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { AddCommandCommand } from '../impl/add-command.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(AddCommandCommand)
export class AddCommandHandler extends BaseCommandHandler<AddCommandCommand, CommandProto> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: AddCommandCommand): Promise<CommandProto> {
    return this.run('AddCommand', async () => {
      const entity = await this.commandService.create(command.request);
      const result = this.commandService.entityToProto(entity);
      this.logger.log('Command added successfully');
      return result;
    });
  }
}
