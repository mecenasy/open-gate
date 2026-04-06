import { Command } from '@nestjs/cqrs';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { SessionData } from 'express-session';

export class PasskeyOptionCommand extends Command<PublicKeyCredentialRequestOptionsJSON> {
  constructor(public readonly session: SessionData) {
    super();
  }
}
