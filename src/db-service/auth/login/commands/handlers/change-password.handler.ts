import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { LoginService } from '../../login.service';
import { ChangePasswordResponse } from 'src/proto/login';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler extends BaseCommandHandler<ChangePasswordCommand, ChangePasswordResponse> {
  constructor(
    private readonly loginService: LoginService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: ChangePasswordCommand): Promise<ChangePasswordResponse> {
    return this.run(
      'ChangePassword',
      async () => {
        const result = await this.loginService.changePassword(command.userId, command.oldPassword, command.newPassword);
        this.logger.log('Password changed successfully', { userId: command.userId });
        return result;
      },
      { userId: command.userId },
    );
  }
}
