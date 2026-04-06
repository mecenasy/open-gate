import { CommandHandler } from '@nestjs/cqrs';
import { RegisterPasskeyOptionCommand } from '../impl/register-passkey-option.command';
import { generateRegistrationOptions, PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import { Handler } from 'src/bff-service/common/handler/handler';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';
import { LoginStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';

@CommandHandler(RegisterPasskeyOptionCommand)
export class RegisterPasskeyOptionHandler extends Handler<
  RegisterPasskeyOptionCommand,
  PublicKeyCredentialCreationOptionsJSON
> {
  private clientUrl: string;

  constructor(private readonly configService: TypeConfigService) {
    super();

    this.clientUrl = this.configService.get<AppConfig>('app')?.clientUrl ?? '';
  }

  async execute({ userId }: RegisterPasskeyOptionCommand): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const user = await this.cache.getFromCache<LoginStatusType['user']>({
      identifier: userId,
      prefix: 'user-state',
    });

    const options = await generateRegistrationOptions({
      rpName: 'Autenticator',
      rpID: this.clientUrl?.replace('https://', ''),
      userID: Buffer.from(userId),
      userName: user?.email ?? '',
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
    });

    await this.cache.saveInCache({
      identifier: userId,
      prefix: 'passkey-option',
      data: options.challenge,
    });

    return options;
  }
}
