import { Command } from '@nestjs/cqrs';
import { SessionData } from 'express-session';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

export class VerifyCodeCommand extends Command<StatusType> {
  constructor(
    public readonly email: string,
    public readonly code: number,
    public readonly session: SessionData,
  ) {
    super();
  }
}
