import { CommandHandler } from '@nestjs/cqrs';
import { SofHandler } from 'src/user-service/common/decorators/sof-handler.decorator';
import { CommandType } from 'src/user-service/common/types/command';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/user-service/status/status';
import { SofCommandHandler } from './command.handler';

@SofHandler(CommandType.Error)
@CommandHandler(SofCommand)
export class ErrorHandler extends SofCommandHandler {
  constructor() {
    super();
  }
  async execute({ command, context }: SofCommand<any>): Promise<Status> {
    console.log('🚀 ~ ErrorHandler ~ execute ~ command:', command);
    await this.processing(command.message, context);
    return { status: false, message: 'Error occurred' };
  }
}
