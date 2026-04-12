import { UserContext } from '../../context/user-context';
import { UnifiedMessage } from 'src/gate-service/message-bridge/platforms/transformer';

export interface QueueMessageData {
  data: UnifiedMessage;
  context: UserContext;
}

export interface QueueMessageToAudioData {
  message: string;
  context: UserContext;
}
