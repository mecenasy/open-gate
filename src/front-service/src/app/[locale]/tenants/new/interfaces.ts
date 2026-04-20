export type WizardStepKey = 'basics' | 'features' | 'contacts';

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

export interface WizardState {
  slug: string;
  name: string;
  slugChecked: boolean;
  slugAvailable: boolean;
  features: TenantFeaturesDraft;
  contacts: ContactDraft[];
}
