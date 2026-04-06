import { Command } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';

export class ResetPasswordCommand extends Command<StatusType> {
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {
    super();
  }
}
