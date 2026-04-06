import { Command } from '@nestjs/cqrs';
import { QrChallengeType } from '../../dto/qr-challenge.type';

export class QrChallengeCommand extends Command<QrChallengeType> {
  constructor(public readonly nonce: string) {
    super();
  }
}
