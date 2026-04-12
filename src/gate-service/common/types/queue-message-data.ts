import { UnifiedMessage } from 'src/notify-service/types/unified-message';
import { UserContext } from '../../context/user-context';

export interface QueueMessageData {
  data: UnifiedMessage;
  context: UserContext;
}

export interface QueueMessageToAudioData {
  data: UnifiedMessage;
  message: string;
  context: UserContext;
}
