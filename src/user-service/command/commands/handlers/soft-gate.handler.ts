import { CommandHandler } from '@nestjs/cqrs';
import { SofHandler } from 'src/user-service/common/decorators/sof-handler.decorator';
import { CommandType } from 'src/user-service/common/types/command';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/user-service/status/status';
import { SoftGateService } from '../../gate/soft-gate.service';
import { SofCommandHandler } from './command.handler';

@SofHandler(CommandType.SideGate)
@CommandHandler(SofCommand)
export class SoftGateHandler extends SofCommandHandler {
  constructor(private readonly softGateService: SoftGateService) {
    super();
  }
  async execute({ command, context }: SofCommand<number>): Promise<Status> {
    await this.softGateService.open(command.data);

    await this.processing(command.message, context);
    return { status: true, message: 'Soft gate command executed' };
  }
}
