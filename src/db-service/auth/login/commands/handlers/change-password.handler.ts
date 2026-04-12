import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { LoginService } from '../../login.service';
import { ChangePasswordResponse } from 'src/proto/login';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, ChangePasswordResponse> {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(ChangePasswordHandler.name);
  }

  async execute(command: ChangePasswordCommand): Promise<ChangePasswordResponse> {
    this.logger.log('Executing ChangePasswordCommand', { userId: command.userId });

    try {
      const result = await this.loginService.changePassword(command.userId, command.oldPassword, command.newPassword);

      this.logger.log('Password changed successfully', { userId: command.userId });
      return result;
    } catch (error) {
      this.logger.error('Failed to change password', error, { userId: command.userId });
      throw error;
    }
  }
}
