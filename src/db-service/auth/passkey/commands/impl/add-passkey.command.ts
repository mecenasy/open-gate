import { Command } from '@nestjs/cqrs';
import { AddPasskeyRequest, PasskeyResponse } from 'src/proto/passkey';

export class AddPasskeyCommand extends Command<PasskeyResponse> {
  constructor(public readonly request: AddPasskeyRequest) {
    super();
  }
}
