import { UserRole, UserStatus } from '@/app/gql/graphql';

export type UserFormMode = 'add' | 'edit';

export type UserSummary = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  status: UserStatus | '%future added value';
  type: UserRole | '%future added value';
};
