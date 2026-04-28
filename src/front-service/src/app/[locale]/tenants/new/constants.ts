import type { PhoneStrategyDraft, PhoneStrategyMode, TenantFeaturesDraft, WizardStepKey } from './interfaces';

/**
 * Two flows live in the wizard now: managed gets the extra phonePicker
 * step (10 numbers + buy), self skips it because the user will paste
 * their own Twilio creds later in the platforms step.
 *
 * Both lists pass through phoneStrategy so the user always makes the
 * managed-vs-self decision before continuing.
 */
export const WIZARD_STEPS_MANAGED: WizardStepKey[] = [
  'basics',
  'features',
  'phoneStrategy',
  'phonePicker',
  'platforms',
  'commands',
  'contacts',
];

export const WIZARD_STEPS_SELF: WizardStepKey[] = [
  'basics',
  'features',
  'phoneStrategy',
  'platforms',
  'commands',
  'contacts',
];

/**
 * Step list for the current strategy. Before the user picks, treat the
 * flow as `self` — phonePicker is invisible until managed is chosen, so
 * the stepper doesn't briefly show a step that may go away.
 */
export const getStepsForStrategy = (mode: PhoneStrategyMode | null): WizardStepKey[] =>
  mode === 'managed' ? WIZARD_STEPS_MANAGED : WIZARD_STEPS_SELF;

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
