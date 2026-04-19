import * as z from 'zod';
import { PromptUserType } from '@/app/gql/graphql';

export const createPromptSchema = (t: (key: string) => string) =>
  z.object({
    commandId: z.string().optional(),
    userType: z.enum(PromptUserType),
    descriptionI18n: z.record(z.string(), z.string()),
    prompt: z.string().min(1, t('required')),
  });

export type PromptFormValues = z.infer<ReturnType<typeof createPromptSchema>>;
