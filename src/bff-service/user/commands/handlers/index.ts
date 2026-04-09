import { CreateUserHandler } from './create-user.handler';
import { UpdateUserHandler } from './update-user.handler';
import { UpdateUserStatusHandler } from './update-user-status.handler';
import { UpdateUserRoleHandler } from './update-user-role.handler';
import { RemoveUserHandler } from './remove-user.handler';
import { CreateUserSimpleHandler } from './create-simple-user.handler';

export const userCommands = [
  CreateUserHandler,
  UpdateUserHandler,
  UpdateUserStatusHandler,
  UpdateUserRoleHandler,
  RemoveUserHandler,
  CreateUserSimpleHandler,
];
