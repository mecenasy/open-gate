import type { TenantFeaturesDraft, WizardStepKey } from './interfaces';

export const WIZARD_STEPS: WizardStepKey[] = ['basics', 'features', 'platforms', 'commands', 'contacts'];

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
