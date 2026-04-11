export interface QrCache extends Record<string, string | undefined> {
  status: string;
  challenge: string;
  userId?: string;
  nonce: string;
  optionChallenge?: string;
}
