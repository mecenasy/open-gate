import { Command } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';

export class ChangePasswordCommand extends Command<StatusType> {
  constructor(
    public readonly userId: string,
    public readonly oldPassword: string,
    public readonly newPassword: string,
  ) {
    super();
  }
}
