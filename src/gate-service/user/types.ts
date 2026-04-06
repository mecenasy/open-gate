import { UserData } from 'src/proto/user';

export enum UserType {
  Admin = 'admin',
  SuperUser = 'super_user',
  Member = 'member',
  User = 'user',
}

export interface User extends Omit<UserData, 'type'> {
  type: UserType;
}
