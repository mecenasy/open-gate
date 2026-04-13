export interface CommunityCustomizationBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: 'small' | 'normal' | 'large';
}

export type MessagingChannel = 'sms' | 'email' | 'signal' | 'whatsapp' | 'messenger';

export interface CommunityCustomizationFeatures {
  // Auth — MFA and Passkey are always available, controlled per-user not per-tenant
  enableSignal: boolean;
  enableWhatsApp: boolean;
  enableMessenger: boolean;
  enableGate: boolean;
  enablePayment: boolean;
  enableCommandScheduling: boolean;
  enableAnalytics: boolean;
  maxUsersPerTenant: number;
}

export interface CommunityCustomizationMessaging {
  defaultSmsProvider: 'twilio' | 'legacy' | 'africastalking';
  // At least one of 'sms' or 'email' must be present
  priorityChannels: MessagingChannel[];
  rateLimitPerMinute: number;
}

export function validateMessagingChannels(channels: MessagingChannel[]): void {
  const hasRequired = channels.includes('sms') || channels.includes('email');
  if (!hasRequired) {
    throw new Error('At least one of sms or email must be enabled in priorityChannels');
  }
}

export interface CommunityCustomizationCommands {
  timeout: number;
  maxRetries: number;
  processingDelay: number;
  customPromptLibraryEnabled: boolean;
}

export interface CommunityCustomizationCompliance {
  dataResidency: string;
  encryptionEnabled: boolean;
  webhookUrl?: string;
}

export interface CommunityCustomization {
  branding: CommunityCustomizationBranding;
  features: CommunityCustomizationFeatures;
  messaging: CommunityCustomizationMessaging;
  commands: CommunityCustomizationCommands;
  compliance: CommunityCustomizationCompliance;
  custom: Record<string, unknown>;
}

export const DEFAULT_CUSTOMIZATION: CommunityCustomization = {
  branding: {},
  features: {
    enableSignal: false,
    enableWhatsApp: false,
    enableMessenger: false,
    enableGate: true,
    enablePayment: false,
    enableCommandScheduling: true,
    enableAnalytics: false,
    maxUsersPerTenant: 1000,
  },
  messaging: {
    defaultSmsProvider: 'twilio',
    priorityChannels: ['sms', 'email'],
    rateLimitPerMinute: 60,
  },
  commands: {
    timeout: 30000,
    maxRetries: 3,
    processingDelay: 0,
    customPromptLibraryEnabled: false,
  },
  compliance: {
    dataResidency: 'EU',
    encryptionEnabled: true,
  },
  custom: {},
};
