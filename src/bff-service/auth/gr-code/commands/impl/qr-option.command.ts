import { Command } from '@nestjs/cqrs';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { SessionData } from 'express-session';

export class QrOptionCommand extends Command<PublicKeyCredentialRequestOptionsJSON> {
  constructor(
    public readonly challenge: string,
    public readonly nonce: string,
    public readonly session: SessionData,
  ) {
    super();
  }
}
