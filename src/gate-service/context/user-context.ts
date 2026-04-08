import { UserData } from 'src/proto/user';
import { MessageType } from '../process/signal/types';
import { protoToUserStatus } from 'src/utils/concert-status';
import { protoToJsUserType } from 'src/utils/user-type-converter';

export type UserContext = Omit<UserData, 'status' | 'type'> & {
  messageType?: MessageType;
  type: ReturnType<typeof protoToJsUserType>;
  status: ReturnType<typeof protoToUserStatus>;
};
