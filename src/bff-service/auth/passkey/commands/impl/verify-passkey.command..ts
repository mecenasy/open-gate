import { Command } from '@nestjs/cqrs';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { SessionData } from 'express-session';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

export class VerifyPasskeyCommand extends Command<StatusType> {
  constructor(
    public readonly session: SessionData,
    public readonly response: AuthenticationResponseJSON,
    public readonly origin: string | undefined,
  ) {
    super();
  }
}
