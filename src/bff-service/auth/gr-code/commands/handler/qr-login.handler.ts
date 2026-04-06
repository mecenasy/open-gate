import { CommandHandler } from '@nestjs/cqrs';
import { QrLoginCommand } from '../impl/qr-login.command';
import { BadRequestException } from '@nestjs/common';
import { QrCache } from './types/types';
import { Handler } from 'src/bff-service/common/handler/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@CommandHandler(QrLoginCommand)
export class QrLoginHandler extends Handler<QrLoginCommand, StatusType> {
  constructor() {
    super();
  }

  async execute({ challenge, nonce, session }: QrLoginCommand) {
    if (!(challenge && nonce)) {
      throw new BadRequestException('Challenge is required');
    }

    const result = await this.cache.getFromCache<QrCache>({
      identifier: challenge,
      prefix: 'qr-challenge',
    });

    if (result?.status !== 'verified' || result.challenge !== challenge) {
      throw new BadRequestException('Wrong challenge');
    }

    if (result && result?.status === 'verified' && result.userId && result.nonce === nonce) {
      session.user_id = result.userId;

      await saveSession(session, this.logger);

      await this.cache.removeFromCache({
        identifier: challenge,
        prefix: 'qr-challenge',
      });
      return { status: AuthStatus.login };
    } else {
      return { status: AuthStatus.logout };
    }
  }
}
