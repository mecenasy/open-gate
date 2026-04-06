import { Handler } from 'src/bff-service/common/handler/handler';
import { VerifyCodeCommand } from '../impl/verify-code.command';
import { CommandHandler } from '@nestjs/cqrs';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { LoginCache } from 'src/bff-service/auth/types/cache-data';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';

@CommandHandler(VerifyCodeCommand)
export class VerifyCodeHandler extends Handler<VerifyCodeCommand, StatusType> {
  constructor() {
    super();
  }
  async execute({ code, email, session }: VerifyCodeCommand): Promise<StatusType> {
    const cache = await this.cache.getFromCache<LoginCache>({
      identifier: email,
    });

    if (cache?.code !== code) {
      return { status: AuthStatus.logout };
    }
    await this.cache.removeFromCache({ identifier: email });

    session.user_id = cache.userId;

    await saveSession(session, this.logger);

    return { status: AuthStatus.login };
  }
}
