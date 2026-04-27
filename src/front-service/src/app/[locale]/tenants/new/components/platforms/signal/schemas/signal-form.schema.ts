import { z } from 'zod';

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export const createSignalFormSchema = (t: (key: string) => string) =>
  z.object({
    apiUrl: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => {
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        { message: t('errorUrl') },
      ),
    account: z
      .string()
      .trim()
      .regex(E164_REGEX, t('errorPhoneE164')),
    mode: z.enum(['register', 'link']),
  });

export type SignalFormSchema = z.infer<ReturnType<typeof createSignalFormSchema>>;
