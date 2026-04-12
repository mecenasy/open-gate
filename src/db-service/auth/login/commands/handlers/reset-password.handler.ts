import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import { LoginService } from '../../login.service';
import { ResetPasswordResponse } from 'src/proto/login';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, ResetPasswordResponse> {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(ResetPasswordHandler.name);
  }

  execute(command: ResetPasswordCommand): Promise<ResetPasswordResponse> {
    this.logger.log('Executing ResetPassword');

    try {
      return this.loginService.resetPassword(command.email, command.password);
    } catch (error) {
      this.logger.error('Error executing ResetPassword', error);
      throw error;
    }
  }
}
