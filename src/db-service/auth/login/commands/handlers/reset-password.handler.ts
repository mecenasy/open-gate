import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import { LoginService } from '../../login.service';
import { ResetPasswordResponse } from 'src/proto/login';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, ResetPasswordResponse> {
  constructor(private readonly loginService: LoginService) {}

  execute(command: ResetPasswordCommand): Promise<ResetPasswordResponse> {
    return this.loginService.resetPassword(command.email, command.password);
  }
}
