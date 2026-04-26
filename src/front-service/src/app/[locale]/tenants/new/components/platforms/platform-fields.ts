/**
 * Platform credential field definitions. The notify-service consumes
 * these JSON shapes (see PlatformCredentialMap in
 * notify-service/platform-config/platform-config.service.ts) — keep field
 * names in sync.
 */

export type PlatformKey = 'signal' | 'sms' | 'smtp' | 'whatsapp' | 'messenger';

export type FieldType = 'text' | 'password' | 'number' | 'url' | 'email';

export interface PlatformFieldDef {
  /** Key inside the resulting credentials JSON. */
  name: string;
  type: FieldType;
  /** i18n key under tenantWizard.platformField.<labelKey>. */
  labelKey: string;
  placeholder?: string;
  required: boolean;
}

export const PLATFORM_FIELDS: Record<PlatformKey, PlatformFieldDef[]> = {
  signal: [
    { name: 'apiUrl', type: 'url', labelKey: 'signal_apiUrl', placeholder: 'https://signal-bridge.local', required: true },
    { name: 'account', type: 'text', labelKey: 'signal_account', placeholder: '+48...', required: true },
  ],
  sms: [
    { name: 'sid', type: 'text', labelKey: 'sms_sid', placeholder: 'ACxxxxxxxx…', required: true },
    { name: 'token', type: 'password', labelKey: 'sms_token', required: true },
    { name: 'phone', type: 'text', labelKey: 'sms_phone', placeholder: '+48...', required: true },
  ],
  smtp: [
    { name: 'host', type: 'text', labelKey: 'smtp_host', placeholder: 'smtp.example.com', required: true },
    { name: 'port', type: 'number', labelKey: 'smtp_port', placeholder: '587', required: true },
    { name: 'user', type: 'text', labelKey: 'smtp_user', required: true },
    { name: 'password', type: 'password', labelKey: 'smtp_password', required: true },
    { name: 'from', type: 'email', labelKey: 'smtp_from', placeholder: 'noreply@example.com', required: true },
  ],
  whatsapp: [
    { name: 'phoneNumberId', type: 'text', labelKey: 'whatsapp_phoneNumberId', required: true },
    { name: 'accessToken', type: 'password', labelKey: 'whatsapp_accessToken', required: true },
  ],
  messenger: [
    { name: 'pageId', type: 'text', labelKey: 'messenger_pageId', required: true },
    { name: 'pageAccessToken', type: 'password', labelKey: 'messenger_pageAccessToken', required: true },
  ],
};

export const PLATFORM_KEYS: PlatformKey[] = ['signal', 'sms', 'smtp', 'whatsapp', 'messenger'];

/** Discriminated state for a single platform inside the wizard. */
export interface PlatformConfigState {
  enabled: boolean;
  config: Record<string, unknown> | null;
}

export type PlatformsState = Record<PlatformKey, PlatformConfigState>;

export const emptyPlatformsState = (): PlatformsState => ({
  signal: { enabled: false, config: null },
  sms: { enabled: false, config: null },
  smtp: { enabled: false, config: null },
  whatsapp: { enabled: false, config: null },
  messenger: { enabled: false, config: null },
});
