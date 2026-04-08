import * as z from 'zod';

export const verificationSchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().min(6, t('codeMin')).max(8, t('codeMax')).regex(/^\d+$/, t('codeDigitsOnly')),
  });
