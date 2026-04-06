import { Command } from '@nestjs/cqrs';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';

export class RegisterPasskeyOptionCommand extends Command<PublicKeyCredentialCreationOptionsJSON> {
  constructor(public readonly userId: string) {
    super();
  }
}
