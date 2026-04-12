import { CommandHandler } from '@nestjs/cqrs';
import { SofHandler } from 'src/gate-service/common/decorators/sof-handler.decorator';
import { CommandType } from 'src/gate-service/common/types/command';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/gate-service/status/status';
import { BaseCommandHandler } from './command.handler';

@SofHandler(CommandType.Help)
@CommandHandler(SofCommand)
export class HelpHandler extends BaseCommandHandler {
  constructor() {
    super();
  }
  async execute({ command, context, platform }: SofCommand<number>): Promise<Status> {
    await this.processing('command.message', context, platform);
    return { status: true, message: 'Soft gate command executed' };
  }
}
