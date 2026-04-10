import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetCounterCommand } from '../impl/set-counter.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(SetCounterCommand)
export class SetCounterHandler implements ICommandHandler<SetCounterCommand, PasskeyResponse> {
  constructor(private readonly passkeyService: PasskeyService) {}

  execute(command: SetCounterCommand): Promise<PasskeyResponse> {
    return this.passkeyService.setCounter(command.request);
  }
}
