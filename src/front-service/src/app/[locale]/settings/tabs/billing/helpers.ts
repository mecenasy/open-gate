export function formatPrice(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return `${amount} ${currency}`;
}

export function formatPriceDelta(cents: number, currency: string): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '−' : '';
  const abs = Math.abs(cents);
  return `${sign}${(abs / 100).toFixed(2)} ${currency}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}
