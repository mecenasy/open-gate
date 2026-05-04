import { BINDING_TOKEN_PATTERN, generateBindingToken } from './token.util';

describe('generateBindingToken', () => {
  it('produces an og- prefix with 6-char base32 suffix', () => {
    for (let i = 0; i < 50; i++) {
      const token = generateBindingToken();
      expect(token).toMatch(/^og-[a-hjkmnp-z2-9]{6}$/);
      expect(BINDING_TOKEN_PATTERN.test(token)).toBe(true);
    }
  });

  it('avoids visually ambiguous characters (0/O, 1/I/L)', () => {
    // Exhaustive sanity over a batch — each token's suffix should not
    // contain any of the banned characters.
    const banned = /[01iIlLoO]/;
    for (let i = 0; i < 200; i++) {
      const token = generateBindingToken();
      const suffix = token.slice(3);
      expect(banned.test(suffix)).toBe(false);
    }
  });

  it('is essentially unique across batches (no duplicates in 1000 draws)', () => {
    // 30 chars × 6 = ~30 bits → ~1B combinations; collision in 1000 is
    // astronomically unlikely. Catches a broken RNG / fixed seed.
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      seen.add(generateBindingToken());
    }
    expect(seen.size).toBe(1000);
  });
});

describe('BINDING_TOKEN_PATTERN', () => {
  it('matches case-insensitive in body text (regex fallback path)', () => {
    expect('please reply OG-7FQ3RK to confirm'.match(BINDING_TOKEN_PATTERN)?.[0]).toBe('OG-7FQ3RK');
    expect('odeślij kod og-abcd23 dziękuję'.match(BINDING_TOKEN_PATTERN)?.[0]).toBe('og-abcd23');
  });

  it('rejects non-token strings that look close', () => {
    expect('og-toolong123'.match(BINDING_TOKEN_PATTERN)?.[0]).toBeUndefined();
    expect('og-12'.match(BINDING_TOKEN_PATTERN)).toBeNull();
    // Banned chars (0, 1, i, l, o) should fail the suffix character class.
    expect('og-aaa0aa'.match(BINDING_TOKEN_PATTERN)).toBeNull();
    expect('og-illlll'.match(BINDING_TOKEN_PATTERN)).toBeNull();
  });
});
