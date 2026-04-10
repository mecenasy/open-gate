import { Command } from '@nestjs/cqrs';
import { PasskeyResponse, RemovePasskeyRequest } from 'src/proto/passkey';

export class RemovePasskeyCommand extends Command<PasskeyResponse> {
  constructor(public readonly request: RemovePasskeyRequest) {
    super();
  }
}
