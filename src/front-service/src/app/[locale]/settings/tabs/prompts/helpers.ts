export const getDescription = (i18n: Record<string, string>, lang = 'en'): string =>
  i18n[lang] ?? i18n['en'] ?? Object.values(i18n)[0] ?? '';

export const parseDescriptionI18n = (json?: string | null): Record<string, string> | undefined => {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return undefined;
  }
};
