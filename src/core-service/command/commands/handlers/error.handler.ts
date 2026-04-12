import { CommandHandler } from '@nestjs/cqrs';
import { SofHandler } from 'src/core-service/common/decorators/sof-handler.decorator';
import { CommandType } from 'src/core-service/common/types/command';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/core-service/status/status';
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
