import { CommandHandler } from '@nestjs/cqrs';
import { PasskeyOptionCommand } from '../impl/passkey-option.command';
import { generateOption } from '../../helpers/option';
import { Handler } from '@app/handler';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';

@CommandHandler(PasskeyOptionCommand)
export class PasskeyOptionHandler extends Handler<PasskeyOptionCommand, PublicKeyCredentialRequestOptionsJSON> {
  clientUrl: string;

  constructor(private readonly configService: TypeConfigService) {
    super();

    this.clientUrl = this.configService.get<AppConfig>('app')?.clientUrl ?? '';
  }

  async execute({ session, origin }: PasskeyOptionCommand): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const options = await generateOption(origin, this.clientUrl ?? '');

    session.currentChallenge = options.challenge;

    await saveSession(session, this.logger);

    return options;
  }
}
