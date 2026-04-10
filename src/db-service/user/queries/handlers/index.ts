import { GetUserHandler } from './get-user.handler';
import { GetUserByPhoneHandler } from './get-user-by-phone.handler';
import { GetAllUsersHandler } from './get-all-users.handler';
import { CheckExistHandler } from './check-exist.handler';
import { GetUserByEmailHandler } from './get-user-by-email.handler';

export const userQueryHandlers = [
  GetUserHandler,
  GetUserByPhoneHandler,
  GetAllUsersHandler,
  CheckExistHandler,
  GetUserByEmailHandler,
];
