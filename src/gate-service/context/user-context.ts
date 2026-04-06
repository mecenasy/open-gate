import { MessageType } from '../process/signal/types';
import type { User } from '../user/types';

export type UserContext = User & {
  messageType?: MessageType;
};
