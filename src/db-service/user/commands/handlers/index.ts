import { AddUserHandler } from './add-user.handler';
import { UpdateUserHandler } from './update-user.handler';
import { UpdateUserStatusHandler } from './update-user-status.handler';
import { UpdateUserRoleHandler } from './update-user-role.handler';
import { RemoveUserHandler } from './remove-user.handler';

export const userCommandHandlers = [
  AddUserHandler,
  UpdateUserHandler,
  UpdateUserStatusHandler,
  UpdateUserRoleHandler,
  RemoveUserHandler,
];
