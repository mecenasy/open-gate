const KEY_PREFIX = 'webauthn_';

export function isCurrentDevice(credentialID: string): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem(`${KEY_PREFIX}${credentialID}`) === 'true';
}

export function markCurrentDevice(credentialID: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${KEY_PREFIX}${credentialID}`, 'true');
}

export function unmarkCurrentDevice(credentialID: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${KEY_PREFIX}${credentialID}`);
}
