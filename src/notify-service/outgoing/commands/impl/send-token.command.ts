import { Platform } from 'src/notify-service/types/platform';
import { TokenType } from 'src/proto/notify';

export class SendTokenCommand {
  constructor(
    public readonly platforms: Platform[],
    public readonly email: string,
    public readonly url: string,
    public readonly type: TokenType,
  ) {}
}
