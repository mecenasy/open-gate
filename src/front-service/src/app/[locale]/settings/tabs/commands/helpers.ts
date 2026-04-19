export const parseJson = <T,>(json?: string | null, fallback: T = {} as T): T => {
  if (!json) return fallback;
  try { return JSON.parse(json) as T; } catch { return fallback; }
};

export const toKeysJson = (keys: string[]): string | undefined =>
  keys.length > 0 ? JSON.stringify(Object.fromEntries(keys.map((k) => [k, true]))) : undefined;

export const getDescription = (i18n: Record<string, string>, lang = 'en'): string =>
  i18n[lang] ?? i18n['en'] ?? Object.values(i18n)[0] ?? '';
