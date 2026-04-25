import type { TenantSettingsTabKey } from './interfaces';
import type { TenantFeaturesForm } from './interfaces';

export const TENANT_SETTINGS_TABS: TenantSettingsTabKey[] = [
  'general',
  'branding',
  'features',
  'messaging',
  'commands',
  'compliance',
  'staff',
];

export const SMS_PROVIDERS = ['twilio', 'legacy', 'africastalking'] as const;

export const MESSAGING_CHANNELS = ['sms', 'email', 'signal', 'whatsapp', 'messenger'] as const;

export const FONT_SIZES = ['small', 'normal', 'large'] as const;

export const RESIDENCIES = ['EU', 'US', 'APAC'] as const;

export const STAFF_ROLES = ['owner', 'admin', 'support'] as const;

export const FEATURE_KEYS: (keyof TenantFeaturesForm)[] = [
  'enableSignal',
  'enableWhatsApp',
  'enableMessenger',
  'enableGate',
  'enablePayment',
  'enableCommandScheduling',
  'enableAnalytics',
  'enableAudioRecognition',
];

export const ROLE_LABEL_KEYS: Record<string, string> = {
  owner: 'roleOwner',
  admin: 'roleAdmin',
  support: 'roleSupport',
};
