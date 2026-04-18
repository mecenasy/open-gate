import * as z from 'zod';

export const createRegisterSchema = (t: (key: string) => string) => {
  const password = z
    .string()
    .min(8, t('passwordMin'))
    .regex(/[A-Z]/, t('passwordUppercase'))
    .regex(/[a-z]/, t('passwordLowercase'))
    .regex(/[0-9]/, t('passwordDigit'))
    .regex(/[^A-Za-z0-9]/, t('passwordSpecial'));

  return z
    .object({
      email: z.string().email(t('emailInvalid')),
      name: z.string().min(2, t('fieldMin2')),
      surname: z.string().min(2, t('fieldMin2')),
      phone: z
        .string()
        .min(9, t('phoneMin'))
        .regex(/^\+?[0-9\s\-]+$/, t('phoneInvalid')),
      password,
      confirmPassword: z.string(),
      tenantSlug: z
        .string()
        .min(3, t('slugMin'))
        .regex(/^[a-z0-9-]+$/, t('slugInvalid')),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('passwordsMismatch'),
      path: ['confirmPassword'],
    });
};

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
