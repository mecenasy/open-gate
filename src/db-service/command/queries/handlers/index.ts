import { GetCommandHandler } from './get-command.handler';
import { GetAllCommandsHandler } from './get-all-commands.handler';
import { GetAllByPermissionHandler } from './get-all-by-permission.handler';
import { GetByPermissionHandler } from './get-by-permission.handler';

export const commandQueryHandlers = [
  GetCommandHandler,
  GetAllCommandsHandler,
  GetAllByPermissionHandler,
  GetByPermissionHandler,
];
