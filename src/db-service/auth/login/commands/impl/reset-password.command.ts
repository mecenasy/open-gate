import { Command } from '@nestjs/cqrs';
import { ResetPasswordResponse } from 'src/proto/login';

export class ResetPasswordCommand extends Command<ResetPasswordResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}
