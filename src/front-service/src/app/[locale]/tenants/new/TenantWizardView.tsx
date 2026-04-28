'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { DEFAULT_FEATURES, DEFAULT_PHONE_STRATEGY, getStepsForStrategy } from './constants';
import type {
  ContactDraft,
  CustomCommandDraft,
  PhoneStrategyDraft,
  PlatformDraft,
  TenantFeaturesDraft,
  WizardStepKey,
} from './interfaces';
import { WizardStepper } from './components/WizardStepper';
import { StepBasics } from './components/StepBasics';
import { StepFeatures } from './components/StepFeatures';
import { StepPlatforms } from './components/StepPlatforms';
import { StepCommands } from './components/StepCommands';
import { StepContacts } from './components/StepContacts';
import { useCreateTenantWizard } from './hooks/use-create-tenant-wizard';
import { useWizardUsage } from './hooks/use-wizard-usage';

export function TenantWizardView() {
  const t = useTranslations('tenantWizard');
  const router = useRouter();
  const [step, setStep] = useState<WizardStepKey>('basics');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [features, setFeatures] = useState<TenantFeaturesDraft>(DEFAULT_FEATURES);
  // Setter is wired in the phoneStrategy step commit; kept on state now so
  // the stepper already knows which flow to render and the persistence
  // hook lands a stable shape.
  const [phoneStrategy] = useState<PhoneStrategyDraft>(DEFAULT_PHONE_STRATEGY);
  const [platforms, setPlatforms] = useState<PlatformDraft[]>([]);
  const [customCommands, setCustomCommands] = useState<CustomCommandDraft[]>([]);
  const [contacts, setContacts] = useState<ContactDraft[]>([]);

  const { submit, isSubmitting, error, partialFailures } = useCreateTenantWizard();
  const usage = useWizardUsage();

  const goHome = () => router.push('/');

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
    setStep('platforms');
  };

  const handlePlatformsBack = (draft: PlatformDraft[]) => {
    setPlatforms(draft);
    setStep('features');
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
