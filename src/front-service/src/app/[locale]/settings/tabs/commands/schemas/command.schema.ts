import * as z from 'zod';

export const createCommandSchema = (t: (key: string) => string) =>
  z.object({
    commandName: z.string().min(1, t('required')),
    active: z.boolean(),
    userTypes: z.array(z.string()),
    actions: z.array(z.string()),
    parameters: z.array(z.string()),
    descriptions: z.record(z.string(), z.string()),
  });

export type CommandFormValues = z.infer<ReturnType<typeof createCommandSchema>>;
