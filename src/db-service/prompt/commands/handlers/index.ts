import { AddPromptHandler } from './add-prompt.handler';
import { UpdatePromptHandler } from './update-prompt.handler';
import { RemovePromptHandler } from './remove-prompt.handler';

export const promptCommandHandlers = [AddPromptHandler, UpdatePromptHandler, RemovePromptHandler];
