import * as z from 'zod';

export const createContactSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, t('fieldMin2')),
      surname: z.string().optional().or(z.literal('')),
      email: z.string().optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
      accessLevel: z.enum(['primary', 'secondary']),
    })
    .refine((d) => Boolean((d.email && d.email.trim()) || (d.phone && d.phone.trim())), {
      message: t('emailOrPhoneRequired'),
      path: ['email'],
    })
    .refine((d) => !d.email || d.email === '' || /.+@.+\..+/.test(d.email), {
      message: t('emailInvalid'),
      path: ['email'],
    });

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
