import { Platform } from 'src/notify-service/types/platform';

export abstract class TokenPlatform {
  abstract platform: Platform;
  abstract send(email: string, url: string): Promise<void>;
}
