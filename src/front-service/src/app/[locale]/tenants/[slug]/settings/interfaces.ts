export type TenantSettingsTabKey =
  | 'general'
  | 'branding'
  | 'features'
  | 'messaging'
  | 'commands'
  | 'compliance'
  | 'staff'
  | 'audit';

export interface AuditEntry {
  id: string;
  tenantId?: string | null;
  userId: string;
  action: string;
  payload?: Record<string, unknown> | null;
  correlationId?: string | null;
  createdAt: string;
}

export interface TenantBrandingForm {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'normal' | 'large' | '';
}

export interface TenantFeaturesForm {
  enableSignal: boolean;
  enableWhatsApp: boolean;
  enableMessenger: boolean;
  enableGate: boolean;
  enablePayment: boolean;
  enableCommandScheduling: boolean;
  enableAnalytics: boolean;
  enableAudioRecognition: boolean;
}

export interface TenantMessagingForm {
  defaultSmsProvider: 'twilio' | 'legacy' | 'africastalking';
  priorityChannels: string[];
  rateLimitPerMinute: number;
}

export interface TenantCommandsForm {
  timeout: number;
  maxRetries: number;
  processingDelay: number;
  customPromptLibraryEnabled: boolean;
}

export interface TenantComplianceForm {
  dataResidency: 'EU' | 'US' | 'APAC';
  encryptionEnabled: boolean;
  webhookUrl: string;
}

export interface TenantStaffEntry {
  tenantId: string;
  userId: string;
  role: string;
}

export type TenantStaffRole = 'owner' | 'admin' | 'support';
