import { CommandHandler } from '@nestjs/cqrs';
import { SofCommand } from '../impl/sof-command';
import { SofHandler } from 'src/gate-service/common/decorators/sof-handler.decorator';
import { CommandAction, CommandType } from 'src/gate-service/common/types/command';
import { Status } from 'src/gate-service/status/status';
import { GateService } from '../../gate/gate.service';
import { BaseCommandHandler } from './command.handler';
import { MessageType } from 'src/gate-service/process/pre-process/types';

@SofHandler(CommandType.Gate)
@CommandHandler(SofCommand)
export class GateHandler extends BaseCommandHandler {
  constructor(private readonly gateService: GateService) {
    super();
  }
  async execute({ command, context, platform }: SofCommand<number>): Promise<Status> {
    if (command.command !== CommandType.Gate && !command.data) {
      await this.processing(command.message ?? '', { ...context, messageType: MessageType.Unknown }, platform);
      throw new Error('Command is required');
    }

    if (command.action === CommandAction.Open) {
      await this.gateService.open(command.command as CommandType.Gate, command.data ?? 1);
    } else {
      await this.gateService.close(command.command as CommandType.Gate, command.data ?? 1);
    }

    await this.processing(command.message ?? '', context, platform);
    const lockKey = `lock:${command.command}.${command.data}`;

    await this.cache.removeFromCache({ identifier: lockKey, prefix: 'command' });

    this.logger.log('Gate command executed');

    return { status: true, message: 'Gate command executed' };
  }
}
