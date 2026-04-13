import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { UpdateCommandCommand } from '../impl/update-command.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(UpdateCommandCommand)
export class UpdateCommandHandler extends BaseCommandHandler<UpdateCommandCommand, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpdateCommandCommand): Promise<CommandProto | null> {
    return this.run('UpdateCommand', async () => {
      const entity = await this.commandService.update(command.id, command.request);
      return entity ? this.commandService.entityToProto(entity) : null;
    });
  }
}
