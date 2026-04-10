import { CommandHandler } from '@nestjs/cqrs';
import { GetPasskeysQuery } from '../impl/get-keys.query';
import { lastValueFrom } from 'rxjs';
import { GetPasskeysResponse, PASSKEY_PROXY_SERVICE_NAME, PasskeyProxyServiceClient } from 'src/proto/passkey';
import { Handler } from '@app/handler';

@CommandHandler(GetPasskeysQuery)
export class GetPasskeysHandler extends Handler<GetPasskeysQuery, any, PasskeyProxyServiceClient> {
  constructor() {
    super(PASSKEY_PROXY_SERVICE_NAME);
  }

  async execute({ userId }: GetPasskeysQuery) {
    let passkeys = await this.cache.getFromCache<GetPasskeysResponse['passkeys']>({
      identifier: userId,
      prefix: 'passkeys',
    });

    if (passkeys) {
      return passkeys;
    }

    passkeys = (await lastValueFrom(this.gRpcService.getPasskeys({ userId }))).passkeys;

    await this.cache.saveInCache<GetPasskeysResponse['passkeys']>({
      identifier: userId,
      prefix: 'passkeys',
      EX: 3600,
      data: passkeys,
    });

    return passkeys;
  }
}
