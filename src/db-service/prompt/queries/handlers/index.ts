import { GetPromptByIdHandler } from './get-prompt-by-id.handler';
import { GetPromptByKeyHandler } from './get-prompt-by-key.handler';
import { GetAllPromptsHandler } from './get-all-prompts.handler';

export const promptQueryHandlers = [GetPromptByIdHandler, GetPromptByKeyHandler, GetAllPromptsHandler];
