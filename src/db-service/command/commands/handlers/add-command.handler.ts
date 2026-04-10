import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddCommandCommand } from '../impl/add-command.command';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@CommandHandler(AddCommandCommand)
export class AddCommandHandler implements ICommandHandler<AddCommandCommand, CommandProto> {
  constructor(private readonly commandService: CommandService) {}

  async execute(command: AddCommandCommand): Promise<CommandProto> {
    const entity = await this.commandService.create(command.request);
    return this.commandService.entityToProto(entity);
  }
}
