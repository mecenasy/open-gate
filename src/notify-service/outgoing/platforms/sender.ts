import { Platform } from 'src/notify-service/types/platform';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export abstract class Sender {
  abstract platform: Platform;
  abstract send(data: UnifiedMessage): Promise<void>;
}
