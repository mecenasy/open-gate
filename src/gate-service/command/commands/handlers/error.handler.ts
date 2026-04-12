import { CommandHandler } from '@nestjs/cqrs';
import { SofHandler } from 'src/gate-service/common/decorators/sof-handler.decorator';
import { CommandType } from 'src/gate-service/common/types/command';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/gate-service/status/status';
import { BaseCommandHandler } from './command.handler';

@SofHandler(CommandType.Error)
@CommandHandler(SofCommand)
export class ErrorHandler extends BaseCommandHandler {
  constructor() {
    super();
  }
  async execute({ command, context, platform }: SofCommand<any>): Promise<Status> {
    await this.processing(command.message ?? '', context, platform);
    return { status: false, message: 'Error occurred' };
  }
}
