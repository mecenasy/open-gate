import { CommandHandler } from '@nestjs/cqrs';
import { SofHandler } from 'src/core-service/common/decorators/sof-handler.decorator';
import { CommandType } from 'src/core-service/common/types/command';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/core-service/status/status';
import { SoftGateService } from '../../gate/soft-gate.service';
import { BaseCommandHandler } from './command.handler';

@SofHandler(CommandType.SideGate)
@CommandHandler(SofCommand)
export class SoftGateHandler extends BaseCommandHandler {
  constructor(private readonly softGateService: SoftGateService) {
    super();
  }
  async execute({ command, context, platform }: SofCommand<number>): Promise<Status> {
    await this.softGateService.open(command.data ?? 1);

    await this.processing(command.message ?? '', context, platform);
    return { status: true, message: 'Soft gate command executed' };
  }
}
