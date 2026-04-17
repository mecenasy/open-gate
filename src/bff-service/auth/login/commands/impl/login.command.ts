import { Command } from '@nestjs/cqrs';
import { SessionData } from 'express-session';
import { StatusType } from '../../dto/status.type';
import { Security } from 'src/bff-service/common/interceptors/security-context.interceptor';

export class LoginCommand extends Command<StatusType> {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly security: Security,
    public readonly session: SessionData,
  ) {
    super();
  }
}
