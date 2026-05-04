import { randomBytes } from 'crypto';

// Crockford-ish base32 minus visually ambiguous chars (0/O, 1/I/L).
// 30 chars × 6 = ~30 bits of entropy in the suffix, plenty for a 7-day
// pending window with a UNIQUE index that catches the rare collision.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const PREFIX = 'og-';
const SUFFIX_LENGTH = 6;

export function generateBindingToken(): string {
  const bytes = randomBytes(SUFFIX_LENGTH);
  let suffix = '';
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    suffix += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${PREFIX}${suffix}`;
}

// Used by the incoming detector for regex-fallback matching.
export const BINDING_TOKEN_PATTERN = /og-[a-hjkmnp-z2-9]{6}/i;
