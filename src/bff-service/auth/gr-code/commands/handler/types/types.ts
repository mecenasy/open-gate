export interface QrCache {
  status: string;
  challenge: string;
  userId?: string;
  nonce: string;
  optionChallenge?: string;
}
