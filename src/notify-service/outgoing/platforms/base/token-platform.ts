import { Platform } from 'src/notify-service/types/platform';
import { TokenType } from 'src/proto/notify';

export abstract class TokenPlatform {
  abstract platform: Platform;
  abstract send(email: string, url: string, type: TokenType): Promise<void>;
}
