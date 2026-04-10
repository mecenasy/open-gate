import { Command } from '@nestjs/cqrs';
import { ChangePasswordResponse } from 'src/proto/login';

export class ChangePasswordCommand extends Command<ChangePasswordResponse> {
  constructor(
    public readonly userId: string,
    public readonly oldPassword: string,
    public readonly newPassword: string,
  ) {
    super();
  }
}
