import { Command } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';
import { SessionData } from 'express-session';

export class LogoutCommand extends Command<StatusType> {
  constructor(
    public readonly userId: string,
    public readonly session: SessionData,
  ) {
    super();
  }
}
