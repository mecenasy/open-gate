import { UserData } from 'src/proto/user';
import { MessageType } from '../process/pre-process/types';
import { protoToUserStatus } from 'src/utils/concert-status';
import { protoToJsUserType } from 'src/utils/user-type-converter';

type UserType = ReturnType<typeof protoToJsUserType>;
type Status = ReturnType<typeof protoToUserStatus>;

export type UserContext =
  | (Omit<UserData, 'status' | 'type'> & {
      messageType?: MessageType;
      type: UserType;
      status: Status;
    })
  | {
      messageType?: MessageType;
      phone: string;
      type: 'unrecognized';
      status: 'pending';
    };
