import { SignalEnvelope } from 'src/user-service/process/signal/types';
import { UserContext } from '../../context/user-context';

export interface QueueMessageData {
  data: SignalEnvelope & { attachment?: Buffer };
  context: UserContext;
}

export interface QueueMessageToAudioData {
  message: string;
  context: UserContext;
}
