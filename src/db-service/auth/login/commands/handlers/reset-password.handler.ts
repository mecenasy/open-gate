import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import { LoginService } from '../../login.service';
import { ResetPasswordResponse } from 'src/proto/login';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler extends BaseCommandHandler<ResetPasswordCommand, ResetPasswordResponse> {
  constructor(
    private readonly loginService: LoginService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: ResetPasswordCommand): Promise<ResetPasswordResponse> {
    return this.run('ResetPassword', () => this.loginService.resetPassword(command.email, command.password));
  }
}
