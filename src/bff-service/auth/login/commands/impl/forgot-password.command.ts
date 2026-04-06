import { Command } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';

export class ForgotPasswordCommand extends Command<StatusType> {
  constructor(public readonly email: string) {
    super();
  }
}
