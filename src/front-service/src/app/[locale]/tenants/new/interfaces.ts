export type WizardStepKey = 'basics' | 'features' | 'platforms' | 'commands' | 'contacts';

export interface TenantFeaturesDraft {
  enableSignal: boolean;
  enableWhatsApp: boolean;
  enableMessenger: boolean;
  enableGate: boolean;
  enablePayment: boolean;
  enableCommandScheduling: boolean;
  enableAnalytics: boolean;
  enableAudioRecognition: boolean;
}

export interface ContactDraft {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  accessLevel: 'primary' | 'secondary';
}

export interface PlatformDraft {
  /** 'signal' | 'sms' | 'smtp' | 'whatsapp' | 'messenger' */
  platform: string;
  /** Stringified JSON credentials; empty string means "use defaults". */
  configJson: string;
}

export interface CustomCommandDraft {
  id: string;
  name: string;
  description: string;
}

export interface WizardState {
  slug: string;
  name: string;
  slugChecked: boolean;
  slugAvailable: boolean;
  features: TenantFeaturesDraft;
  platforms: PlatformDraft[];
  customCommands: CustomCommandDraft[];
  contacts: ContactDraft[];
}
