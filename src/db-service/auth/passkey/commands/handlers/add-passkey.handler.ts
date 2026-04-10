import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddPasskeyCommand } from '../impl/add-passkey.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(AddPasskeyCommand)
export class AddPasskeyHandler implements ICommandHandler<AddPasskeyCommand, PasskeyResponse> {
  constructor(private readonly passkeyService: PasskeyService) {}

  execute(command: AddPasskeyCommand): Promise<PasskeyResponse> {
    return this.passkeyService.addPasskey(command.request);
  }
}
