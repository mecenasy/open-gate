import { GetPromptHandler } from './get-prompt-by-id.handler';
import { GetAllPromptsHandler } from './get-all-prompts.handler';
import { GetPromptByKeyHandler } from './get-prompt-by-key.handler';

export const promptQueries = [GetPromptHandler, GetAllPromptsHandler, GetPromptByKeyHandler];
