import { User } from '../entity/user.entity';
import { UserData } from 'src/proto/user';
import { userStatusToProto } from 'src/utils/concert-status';
import { jsToProtoUserType } from 'src/utils/user-type-converter';

export function entityToProto(user: User): UserData {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    surname: user.surname,
    status: userStatusToProto(user.status),
    type: jsToProtoUserType(user.userRole.userType),
  };
}
