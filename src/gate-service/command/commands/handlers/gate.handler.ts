import { CommandHandler } from '@nestjs/cqrs';
import { SofCommand } from '../impl/sof-command';
import { SofHandler } from 'src/gate-service/common/decorators/sof-handler.decorator';
import { CommandAction, CommandType } from 'src/gate-service/common/types/command';
import { Status } from 'src/gate-service/status/status';
import { GateService } from '../../gate/gate.service';
import { SofCommandHandler } from './command.handler';
import { MessageType } from 'src/gate-service/process/signal/types';

@SofHandler(CommandType.Gate)
@CommandHandler(SofCommand)
export class GateHandler extends SofCommandHandler {
  constructor(private readonly gateService: GateService) {
    super();
  }
  async execute({ command, context }: SofCommand<number>): Promise<Status> {
    if (command.command !== CommandType.Gate) {
      await this.processing(command.message, { ...context, messageType: MessageType.Unknown });
      throw new Error('Command is required');
    }

    if (command.action === CommandAction.Open) {
      await this.gateService.open(command.command, command.data);
    } else {
      await this.gateService.close(command.command, command.data);
    }

    await this.processing(command.message, context);

    this.logger.log('Gate command executed');

    return { status: true, message: 'Gate command executed' };
  }
}
