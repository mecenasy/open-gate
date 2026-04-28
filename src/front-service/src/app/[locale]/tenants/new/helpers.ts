/**
 * Formats a price in cents as a localized currency string. Returns the
 * "free" string from i18n when both cents are 0.
 */
export const formatCents = (cents: number, currency: string, freeLabel: string): string => {
  if (cents <= 0) return freeLabel;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    // Unknown currency — fall back to a plain number with the currency
    // suffix. Browsers reject random ISO codes; we don't want a stray
    // mis-seeded plan to crash the wizard.
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};
