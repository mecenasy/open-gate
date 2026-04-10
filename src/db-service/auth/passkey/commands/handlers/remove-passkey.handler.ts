import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemovePasskeyCommand } from '../impl/remove-passkey.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(RemovePasskeyCommand)
export class RemovePasskeyHandler implements ICommandHandler<RemovePasskeyCommand, PasskeyResponse> {
  constructor(private readonly passkeyService: PasskeyService) {}

  execute(command: RemovePasskeyCommand): Promise<PasskeyResponse> {
    return this.passkeyService.removePasskey(command.request);
  }
}
