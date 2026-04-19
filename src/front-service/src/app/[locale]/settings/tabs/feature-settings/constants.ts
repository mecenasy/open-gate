export const PLATFORM_FIELDS: Record<string, string[]> = {
  signal: ['apiUrl', 'account'],
  sms: ['sid', 'token', 'phone'],
  smtp: ['host', 'port', 'user', 'password', 'from'],
  whatsapp: ['phoneNumberId', 'accessToken'],
  messenger: ['pageAccessToken', 'pageId'],
};
