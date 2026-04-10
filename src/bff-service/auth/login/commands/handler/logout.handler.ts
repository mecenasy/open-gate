import { CommandHandler } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';
import { LogoutCommand } from '../impl/logout.command';
import { InternalServerErrorException } from '@nestjs/common';
import { Handler } from '@app/handler';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(LogoutCommand)
export class LogoutHandler extends Handler<LogoutCommand, StatusType> {
  constructor() {
    super();
  }

  async execute({ session }: LogoutCommand) {
    await new Promise<void>((resolve, reject) => {
      session.destroy((err) => {
        if (err) {
          reject(new InternalServerErrorException('Failed to save session.'));
          this.logger.error(err);
        } else {
          resolve();
        }
      });
    });

    return { status: AuthStatus.logout };
  }
}
