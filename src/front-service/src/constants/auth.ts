export const PUBLIC_PATHS = [
  '/',
  '/reset-password',
  '/forgot-password',
  '/qr-verify',
  '/thankyou',
  '/confirm-registration',
] as const;

export const GUEST_ONLY_PATHS = ['/login', '/registration'] as const;

export const LOGIN_PATH = '/login';
export const HOME_PATH = '/';
