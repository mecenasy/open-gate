import { Command } from '@nestjs/cqrs';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';

export class QrConfirmCommand extends Command<any> {
  constructor(
    public readonly challenge: string,
    public readonly response: AuthenticationResponseJSON,
  ) {
    super();
  }
}
