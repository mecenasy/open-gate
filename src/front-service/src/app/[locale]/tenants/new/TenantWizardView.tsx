'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { DEFAULT_FEATURES } from './constants';
import type { ContactDraft, TenantFeaturesDraft, WizardStepKey } from './interfaces';
import { WizardStepper } from './components/WizardStepper';
import { StepBasics } from './components/StepBasics';
import { StepFeatures } from './components/StepFeatures';
import { StepContacts } from './components/StepContacts';
import { useCreateTenantWizard } from './hooks/use-create-tenant-wizard';

export function TenantWizardView() {
  const t = useTranslations('tenantWizard');
  const router = useRouter();
  const [step, setStep] = useState<WizardStepKey>('basics');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [features, setFeatures] = useState<TenantFeaturesDraft>(DEFAULT_FEATURES);
  const [contacts, setContacts] = useState<ContactDraft[]>([]);

  const { submit, isSubmitting, error } = useCreateTenantWizard();

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
    setStep('contacts');
  };

  const handleContactsBack = (draft: ContactDraft[]) => {
    setContacts(draft);
    setStep('features');
  };

  const handleContactsFinish = async (draft: ContactDraft[]) => {
    setContacts(draft);
    const tenantId = await submit({ slug, features, contacts: draft });
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

      <WizardStepper current={step} />

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
