import { z } from 'zod';
import { RESIDENCIES } from '../constants';

export type ComplianceSchemaT = ReturnType<typeof createComplianceSchema>;

export const createComplianceSchema = (t: (key: string) => string) =>
  z.object({
    dataResidency: z.enum(RESIDENCIES),
    encryptionEnabled: z.boolean(),
    webhookUrl: z
      .string()
      .trim()
      .refine((v) => v === '' || /^https?:\/\//.test(v), { message: t('errorUrl') }),
  });

export type ComplianceFormValues = z.infer<ComplianceSchemaT>;
