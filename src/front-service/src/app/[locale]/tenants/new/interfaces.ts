export type WizardStepKey =
  | 'basics'
  | 'features'
  | 'phoneStrategy'
  | 'phonePicker'
  | 'platforms'
  | 'commands'
  | 'contacts';

/** 'managed' = we buy the number, 'self' = user brings their own Twilio. */
export type PhoneStrategyMode = 'managed' | 'self';

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

/**
 * Carries the wizard's choice between managed (we procure the number) and
 * self (user brings their own Twilio). For managed flow, after the user
 * picks a number from the picker step, `purchasedPhoneE164` and
 * `pendingPurchaseId` are filled in — those are what later steps lock the
 * SMS tile and Signal modal against.
 *
 * `mode` is null until the user explicitly picks on the phoneStrategy
 * step — we don't pre-select to force an active decision rather than a
 * silent default the user might miss.
 */
export interface PhoneStrategyDraft {
  mode: PhoneStrategyMode | null;
  purchasedPhoneE164?: string;
  pendingPurchaseId?: string;
}

export interface WizardState {
  slug: string;
  name: string;
  slugChecked: boolean;
  slugAvailable: boolean;
  features: TenantFeaturesDraft;
  phoneStrategy: PhoneStrategyDraft;
  platforms: PlatformDraft[];
  customCommands: CustomCommandDraft[];
  contacts: ContactDraft[];
}
