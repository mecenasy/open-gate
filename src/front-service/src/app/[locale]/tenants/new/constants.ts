import type { PhoneStrategyDraft, TenantFeaturesDraft, WizardStepKey } from './interfaces';

/**
 * One linear step list — the managed-vs-self decision and the picker
 * collapsed into a single phoneAcquisition step driven by its own
 * machine, so the stepper has the same shape regardless of strategy.
 */
export const WIZARD_STEPS: WizardStepKey[] = [
  'basics',
  'features',
  'phoneAcquisition',
  'platforms',
  'commands',
  'contacts',
];

export const PLATFORM_KEYS = ['signal', 'sms', 'smtp', 'whatsapp', 'messenger'] as const;

export const DEFAULT_FEATURES: TenantFeaturesDraft = {
  enableSignal: false,
  enableWhatsApp: false,
  enableMessenger: false,
  enableGate: false,
  enablePayment: false,
  enableCommandScheduling: false,
  enableAnalytics: false,
  enableAudioRecognition: false,
};

export const DEFAULT_PHONE_STRATEGY: PhoneStrategyDraft = {
  mode: null,
};

export const FEATURE_KEYS: (keyof TenantFeaturesDraft)[] = [
  'enableSignal',
  'enableWhatsApp',
  'enableMessenger',
  'enableGate',
  'enablePayment',
  'enableCommandScheduling',
  'enableAnalytics',
  'enableAudioRecognition',
];

export const ACCESS_LEVEL_LABEL_KEYS: Record<'primary' | 'secondary', string> = {
  primary: 'accessPrimary',
  secondary: 'accessSecondary',
};
