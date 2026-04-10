import { Handler } from '@app/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { CommandProcessCommand } from '../impl/command-process.command';

@CommandHandler(CommandProcessCommand)
export class CommandProcessHandler extends Handler<CommandProcessCommand, any> {
  constructor() {
    super();
  }
  async execute({}: CommandProcessCommand): Promise<any> {}
}
