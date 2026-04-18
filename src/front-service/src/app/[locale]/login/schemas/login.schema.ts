import * as z from 'zod';

export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('emailInvalid')),
    password: z
      .string()
      .min(8, t('passwordMin'))
      .regex(/[A-Z]/, t('passwordUppercase'))
      .regex(/[a-z]/, t('passwordLowercase'))
      .regex(/[0-9]/, t('passwordDigit'))
      .regex(/[^A-Za-z0-9]/, t('passwordSpecial')),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
