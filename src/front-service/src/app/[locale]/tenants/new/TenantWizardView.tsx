'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { DEFAULT_FEATURES, DEFAULT_PHONE_STRATEGY, getStepsForStrategy } from './constants';
import type {
  ContactDraft,
  CustomCommandDraft,
  PhoneStrategyDraft,
  PlatformDraft,
  TenantFeaturesDraft,
  WizardState,
  WizardStepKey,
} from './interfaces';
import { WizardStepper } from './components/WizardStepper';
import { StepBasics } from './components/StepBasics';
import { StepFeatures } from './components/StepFeatures';
import { StepPhoneStrategy } from './components/StepPhoneStrategy';
import { StepPhonePicker } from './components/StepPhonePicker';
import { StepPlatforms } from './components/StepPlatforms';
import { StepCommands } from './components/StepCommands';
import { StepContacts } from './components/StepContacts';
import { useCreateTenantWizard } from './hooks/use-create-tenant-wizard';
import { useWizardUsage } from './hooks/use-wizard-usage';
import { useWizardPersistence } from './hooks/use-wizard-persistence';

export function TenantWizardView() {
  const t = useTranslations('tenantWizard');
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStepKey>('basics');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [features, setFeatures] = useState<TenantFeaturesDraft>(DEFAULT_FEATURES);
  const [phoneStrategy, setPhoneStrategy] = useState<PhoneStrategyDraft>(DEFAULT_PHONE_STRATEGY);
  const [platforms, setPlatforms] = useState<PlatformDraft[]>([]);
  const [customCommands, setCustomCommands] = useState<CustomCommandDraft[]>([]);
  const [contacts, setContacts] = useState<ContactDraft[]>([]);

  const { submit, isSubmitting, error, partialFailures } = useCreateTenantWizard();
  const usage = useWizardUsage();

  const wizardState = useMemo<WizardState>(
    () => ({ step, slug, name, features, phoneStrategy, platforms, customCommands, contacts }),
    [step, slug, name, features, phoneStrategy, platforms, customCommands, contacts],
  );
  const persistence = useWizardPersistence(wizardState, user?.id ?? null);

  const goHome = () => router.push('/');

  const resumeDraft = () => {
    const draft = persistence.loadDraft();
    if (!draft) return;
    setStep(draft.step);
    setSlug(draft.slug);
    setName(draft.name);
    setFeatures(draft.features);
    setPhoneStrategy(draft.phoneStrategy);
    setPlatforms(draft.platforms);
    setCustomCommands(draft.customCommands);
    setContacts(draft.contacts);
  };

  const startOver = () => {
    persistence.clearDraft();
  };

  const handleBasicsNext = (values: { slug: string; name: string }) => {
    setSlug(values.slug);
    setName(values.name);
    setStep('features');
  };

  const handleFeaturesBack = (draft: TenantFeaturesDraft) => {
    setFeatures(draft);
    setStep('basics');
  };

  const handleFeaturesNext = (draft: TenantFeaturesDraft) => {
    setFeatures(draft);
    setStep('phoneStrategy');
  };

  const handlePhoneStrategyBack = (draft: PhoneStrategyDraft) => {
    setPhoneStrategy(draft);
    setStep('features');
  };

  const handlePhoneStrategyNext = (draft: PhoneStrategyDraft) => {
    setPhoneStrategy(draft);
    // Picker step belongs to the managed flow only; self users go
    // straight to platforms where they'll paste their own Twilio creds.
    setStep(draft.mode === 'managed' ? 'phonePicker' : 'platforms');
  };

  const handlePhonePickerBack = (draft: PhoneStrategyDraft) => {
    setPhoneStrategy(draft);
    setStep('phoneStrategy');
  };

  const handlePhonePickerNext = (draft: PhoneStrategyDraft) => {
    setPhoneStrategy(draft);
    setStep('platforms');
  };

  const handlePlatformsBack = (draft: PlatformDraft[]) => {
    setPlatforms(draft);
    // Self flow comes back to phoneStrategy, managed comes back to phonePicker.
    setStep(phoneStrategy.mode === 'managed' ? 'phonePicker' : 'phoneStrategy');
  };

  const handlePlatformsNext = (draft: PlatformDraft[]) => {
    setPlatforms(draft);
    setStep('commands');
  };

  const handleCommandsBack = (draft: CustomCommandDraft[]) => {
    setCustomCommands(draft);
    setStep('platforms');
  };

  const handleCommandsNext = (draft: CustomCommandDraft[]) => {
    setCustomCommands(draft);
    setStep('contacts');
  };

  const handleContactsBack = (draft: ContactDraft[]) => {
    setContacts(draft);
    setStep('commands');
  };

  const handleContactsFinish = async (draft: ContactDraft[]) => {
    setContacts(draft);
    const tenantId = await submit({
      slug,
      features,
      platforms,
      customCommands,
      contacts: draft,
    });
    if (tenantId) {
      persistence.clearDraft();
      router.push('/');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-text">{t('title')}</h1>
        <p className="text-sm text-muted mt-1">{t('subtitle', { name: name || slug || t('yourTenant') })}</p>
      </header>

      <WizardStepper current={step} steps={getStepsForStrategy(phoneStrategy.mode)} />

      {persistence.hasDraft && (
        <div className="bg-blue-500/5 border border-blue-500/40 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-blue-200">
            {t('resumeDraftBody', {
              savedAt: persistence.draftSavedAt ? new Date(persistence.draftSavedAt).toLocaleString() : '',
            })}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="green" onClick={startOver}>
              {t('resumeDraftStartOver')}
            </Button>
            <Button type="button" variant="blue" onClick={resumeDraft}>
              {t('resumeDraftResume')}
            </Button>
          </div>
        </div>
      )}

      {partialFailures.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/40 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-amber-300">{t('partialFailureTitle')}</p>
          <ul className="text-xs text-amber-200 mt-1 list-disc list-inside">
            {partialFailures.map((f, idx) => (
              <li key={idx}>
                {t(`partialFailure_${f.step}` as Parameters<typeof t>[0], { id: f.identifier })}: {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'basics' && (
        <StepBasics
          defaultSlug={slug}
          defaultName={name}
          onCancel={goHome}
          onNext={handleBasicsNext}
        />
      )}

      {step === 'features' && (
        <StepFeatures
          defaultFeatures={features}
          onBack={handleFeaturesBack}
          onNext={handleFeaturesNext}
        />
      )}

      {step === 'phoneStrategy' && (
        <StepPhoneStrategy
          defaultStrategy={phoneStrategy}
          phoneNumbersIncluded={usage.phoneNumbersIncluded}
          messagesPerMonthIncluded={usage.messagesPerMonthIncluded}
          pricePerExtraMessageCents={usage.pricePerExtraMessageCents}
          currency={usage.currency}
          onBack={handlePhoneStrategyBack}
          onNext={handlePhoneStrategyNext}
        />
      )}

      {step === 'phonePicker' && (
        <StepPhonePicker
          defaultStrategy={phoneStrategy}
          onBack={handlePhonePickerBack}
          onNext={handlePhonePickerNext}
        />
      )}

      {step === 'platforms' && (
        <StepPlatforms
          defaultPlatforms={platforms}
          maxPlatforms={usage.maxPlatformsPerTenant}
          onBack={handlePlatformsBack}
          onNext={handlePlatformsNext}
        />
      )}

      {step === 'commands' && (
        <StepCommands
          defaultCommands={customCommands}
          maxCommands={usage.maxCustomCommandsPerTenant}
          onBack={handleCommandsBack}
          onNext={handleCommandsNext}
        />
      )}

      {step === 'contacts' && (
        <StepContacts
          defaultContacts={contacts}
          isSubmitting={isSubmitting}
          error={error}
          onBack={handleContactsBack}
          onFinish={handleContactsFinish}
        />
      )}
    </div>
  );
}
