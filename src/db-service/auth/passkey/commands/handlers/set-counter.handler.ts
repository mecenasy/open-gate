import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { SetCounterCommand } from '../impl/set-counter.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(SetCounterCommand)
export class SetCounterHandler extends BaseCommandHandler<SetCounterCommand, PasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: SetCounterCommand): Promise<PasskeyResponse> {
    return this.run('SetCounter', () => this.passkeyService.setCounter(command.request));
  }
}
