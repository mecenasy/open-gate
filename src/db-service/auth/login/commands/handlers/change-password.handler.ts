import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { LoginService } from '../../login.service';
import { ChangePasswordResponse } from 'src/proto/login';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, ChangePasswordResponse> {
  constructor(private readonly loginService: LoginService) {}

  execute(command: ChangePasswordCommand): Promise<ChangePasswordResponse> {
    return this.loginService.changePassword(command.userId, command.oldPassword, command.newPassword);
  }
}
