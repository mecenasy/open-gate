import * as z from 'zod';

export const createSlugSchema = (t: (key: string) => string) =>
  z.object({
    slug: z
      .string()
      .min(3, t('slugMin'))
      .regex(/^[a-z0-9-]+$/, t('slugInvalid')),
    name: z.string().min(2, t('fieldMin2')),
  });

export type SlugFormValues = z.infer<ReturnType<typeof createSlugSchema>>;
