import { z } from 'zod';
import { PLATFORM_FIELDS, type PlatformKey } from './platform-fields';

/**
 * Builds a zod schema dynamically from the PLATFORM_FIELDS catalog so
 * the form definition stays the single source of truth.
 *
 * - text/password/url/email   → required string ≥ 1 char (URL/email shape
 *   validated when the type narrows it)
 * - number                    → coerced int ≥ 1 (RHF passes string from
 *   <input type=number>; we coerce on the schema side rather than relying
 *   on valueAsNumber for stable error semantics)
 */
export const createPlatformSchema = (platform: PlatformKey, t: (key: string) => string) => {
  const fields = PLATFORM_FIELDS[platform];
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let validator: z.ZodTypeAny;
    if (field.type === 'number') {
      validator = z.coerce.number().int().min(1, t('errorRequired'));
    } else if (field.type === 'url') {
      validator = z.string().trim().min(1, t('errorRequired')).url(t('errorUrl'));
    } else if (field.type === 'email') {
      validator = z.email(t('errorEmail'));
    } else {
      validator = z.string().trim().min(1, t('errorRequired'));
    }
    shape[field.name] = validator;
  }
  return z.object(shape);
};

export type PlatformFormValues = Record<string, string | number>;
