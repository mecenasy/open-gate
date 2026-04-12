import { UnifiedMessage } from 'src/notify-service/types/unified-message';
import { UserContext } from '../../context/user-context';
import { Platform } from 'src/notify-service/types/platform';

export interface QueueMessageData {
  data: UnifiedMessage;
  context: UserContext;
}

export interface QueueMessageToAudioData {
  platform: Platform;
  message: string;
  context: UserContext;
}
