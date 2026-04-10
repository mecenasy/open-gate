import { AddCommandHandler } from './add-command.handler';
import { UpdateCommandHandler } from './update-command.handler';
import { RemoveCommandHandler } from './remove-command.handler';
import { ToggleActiveStatusHandler } from './toggle-active-status.handler';

export const commandCommandHandlers = [
  AddCommandHandler,
  UpdateCommandHandler,
  RemoveCommandHandler,
  ToggleActiveStatusHandler,
];
