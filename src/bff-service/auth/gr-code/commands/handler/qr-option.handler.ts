import { CommandHandler } from '@nestjs/cqrs';
import { QrOptionCommand } from '../impl/qr-option.command';
import { QrCache } from './types/types';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { BadRequestException } from '@nestjs/common';
import { Handler } from '@app/handler';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';
import { generateOption } from 'src/bff-service/auth/passkey/helpers/option';

@CommandHandler(QrOptionCommand)
export class QrOptionHandler extends Handler<QrOptionCommand, PublicKeyCredentialRequestOptionsJSON> {
  constructor(private readonly configService: TypeConfigService) {
    super();
  }

  async execute({ challenge, nonce, session }: QrOptionCommand) {
    if (!challenge) {
      throw new BadRequestException('Challenge is required');
    }

    const result = await this.cache.getFromCache<QrCache>({
      identifier: challenge,
      prefix: 'qr-challenge',
    });

    if (result?.status !== 'pending' || result.nonce !== nonce) {
      throw new BadRequestException('Wrong challenge.');
    }

    const options = await generateOption(undefined, this.configService.get<AppConfig>('app')?.clientUrl ?? '');

    session.currentChallenge = result.challenge;

    await this.cache.saveInCache<QrCache>({
      identifier: challenge,
      prefix: 'qr-challenge',
      EX: 60,
      data: {
        ...result,
        status: 'optioned',
        optionChallenge: options.challenge,
      },
    });

    return options;
  }
}
