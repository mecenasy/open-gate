import { CommandHandler } from '@nestjs/cqrs';
import { RemovePasskeyCommand } from '../impl/remove-passkey.command';
import { GetPasskeysResponse, PASSKEY_PROXY_SERVICE_NAME, PasskeyProxyServiceClient } from 'src/proto/passkey';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';

@CommandHandler(RemovePasskeyCommand)
export class RemovePasskeyHandler extends Handler<
  RemovePasskeyCommand,
  { status: boolean },
  PasskeyProxyServiceClient
> {
  constructor() {
    super(PASSKEY_PROXY_SERVICE_NAME);
  }

  async execute({ id, userId }: RemovePasskeyCommand) {
    const result = await lastValueFrom(this.gRpcService.removePasskey({ id }));
    if (!result.success) {
      return Promise.resolve({ status: false });
    }
    const passkeys = await this.cache.getFromCache<GetPasskeysResponse['passkeys']>({
      identifier: userId,
      prefix: 'passkeys',
    });

    if (passkeys) {
      const newPasskeys = passkeys.filter((passkey) => passkey.id !== id);
      await this.cache.saveInCache<GetPasskeysResponse['passkeys']>({
        identifier: userId,
        prefix: 'passkeys',
        EX: 3600,
        data: newPasskeys,
      });
    }

    return Promise.resolve({ status: true });
  }
}
