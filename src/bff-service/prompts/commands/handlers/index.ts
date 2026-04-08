import { AddPromptHandler } from './add-prompt.handler';
import { UpdatePromptHandler } from './update-prompt.handler';
import { RemovePromptHandler } from './remove-prompt.handler';

export const promptCommands = [AddPromptHandler, UpdatePromptHandler, RemovePromptHandler];
