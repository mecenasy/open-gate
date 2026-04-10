import { Command } from '@nestjs/cqrs';
import { PasskeyResponse, SetCounterRequest } from 'src/proto/passkey';

export class SetCounterCommand extends Command<PasskeyResponse> {
  constructor(public readonly request: SetCounterRequest) {
    super();
  }
}
