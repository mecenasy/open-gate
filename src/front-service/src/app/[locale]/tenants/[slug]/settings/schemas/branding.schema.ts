import { z } from 'zod';
import { FONT_SIZES } from '../constants';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

export type BrandingSchemaT = ReturnType<typeof createBrandingSchema>;

export const createBrandingSchema = (t: (key: string) => string) =>
  z.object({
    logoUrl: z
      .string()
      .trim()
      .refine((v) => v === '' || /^https?:\/\//.test(v), { message: t('errorUrl') }),
    primaryColor: z
      .string()
      .trim()
      .refine((v) => v === '' || HEX_COLOR_RE.test(v), { message: t('errorHex') }),
    secondaryColor: z
      .string()
      .trim()
      .refine((v) => v === '' || HEX_COLOR_RE.test(v), { message: t('errorHex') }),
    fontSize: z.union([z.enum(FONT_SIZES), z.literal('')]),
  });

export type BrandingFormValues = z.infer<BrandingSchemaT>;
