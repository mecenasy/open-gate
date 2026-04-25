import { z } from 'zod';

export type CommandsSchemaT = ReturnType<typeof createCommandsSchema>;

export const createCommandsSchema = (t: (key: string) => string) =>
  z.object({
    timeout: z.number().int().min(100, t('errorTimeout')),
    maxRetries: z.number().int().min(0, t('errorRetries')),
    processingDelay: z.number().int().min(0, t('errorDelay')),
    customPromptLibraryEnabled: z.boolean(),
  });

export type CommandsFormValues = z.infer<CommandsSchemaT>;
