export const signalConfigMap = ['bot-number'];

export const smtpConfigMap = ['smtp-port', 'smtp-host', 'smtp-password', 'smtp-user', 'smtp-from'];

export const groqConfigMap = ['api-key', 'api-url'];

export const smsConfigMap = ['sms-account-sid', 'sms-auth-token', 'sms-from'];

export const twilioConfigMap = ['twilio-account-sid', 'twilio-auth-token', 'twilio-from'];

export const whatsappConfigMap = [
  'whatsapp-phone-twilio',
  'whatsapp-phone-meta',
  'whatsapp-phone-id',
  'whatsapp-business-id',
  'whatsapp-access-token',
  'whatsapp-verify-token',
];

export const coreConfigMap = ['command', 'message', 'audio', 'signal', 'whatsapp', 'sms', 'email', 'groq'];
export const featuresConfigMap = ['signal', 'whatsapp', 'email', 'sms', 'groq'];

export const configMaps = {
  signal: signalConfigMap,
  email: smtpConfigMap,
  groq: groqConfigMap,
  sms: smsConfigMap,
  twilio: twilioConfigMap,
  whatsapp: whatsappConfigMap,
  feature: featuresConfigMap,
};
