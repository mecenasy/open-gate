import { CommandHandler } from '@nestjs/cqrs';
import { QrRejectCommand } from '../impl/qr-reject.command';
import { BadRequestException } from '@nestjs/common';
import { QrCache } from './types/types';
import { Handler } from 'src/bff-service/common/handler/handler';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';
import { Getaway } from 'src/bff-service/common/getaway/getaway.getaway';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';

@CommandHandler(QrRejectCommand)
export class QrRejectHandler extends Handler<QrRejectCommand, StatusType> {
  constructor(private readonly gateway: Getaway) {
    super();
  }

  async execute({ challenge, session }: QrRejectCommand) {
    if (!challenge) {
      throw new BadRequestException('Challenge is required');
    }

    const result = await this.cache.getFromCache<QrCache>({
      identifier: challenge,
      prefix: 'qr-challenge',
    });

    if (!result) {
      return { status: AuthStatus.logout };
    }

    session.currentChallenge = undefined;

    this.sendAuthStatus('rejected', result);
    await saveSession(session, this.logger);
    await this.cache.removeFromCache({
      identifier: challenge,
      prefix: 'qr-challenge',
    });

    return { status: AuthStatus.logout };
  }

  private sendAuthStatus(status: 'rejected' | 'verified' | 'unVerified', data: QrCache) {
    this.gateway.server.to(data.challenge).emit('challenge', {
      status,
      type: 'QR-AUTH',
      nonce: data.nonce,
    });
  }
}
