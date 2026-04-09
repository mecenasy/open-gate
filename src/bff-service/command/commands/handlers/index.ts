import { AddCommandHandler } from './add-command.handler';
import { UpdateCommandHandler } from './update-command.handler';
import { ToggleActiveStatusHandler } from './toggle-active-status.handler';
import { RemoveCommandHandler } from './remove-command.handler';

export const commandCommands = [
  AddCommandHandler,
  UpdateCommandHandler,
  ToggleActiveStatusHandler,
  RemoveCommandHandler,
];
