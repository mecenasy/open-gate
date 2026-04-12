import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { SetCounterCommand } from '../impl/set-counter.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(SetCounterCommand)
export class SetCounterHandler implements ICommandHandler<SetCounterCommand, PasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(SetCounterHandler.name);
  }

  execute(command: SetCounterCommand): Promise<PasskeyResponse> {
    this.logger.log('Executing SetCounter');

    try {
      return this.passkeyService.setCounter(command.request);
    } catch (error) {
      this.logger.error('Error executing SetCounter', error);
      throw error;
    }
  }
}
