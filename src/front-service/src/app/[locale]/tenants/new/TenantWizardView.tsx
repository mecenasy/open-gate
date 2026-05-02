'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { WIZARD_STEPS } from './constants';
import { WizardStepper } from './components/WizardStepper';
import { StepBasics } from './components/StepBasics';
import { StepFeatures } from './components/StepFeatures';
import { StepPhoneAcquisition } from './components/StepPhoneAcquisition';
import { StepPlatforms } from './components/StepPlatforms';
import { StepCommands } from './components/StepCommands';
import { StepContacts } from './components/StepContacts';
import { useTenantWizard } from './hooks/use-tenant-wizard';
import { useWizardUsage } from './hooks/use-wizard-usage';
import { useWizardPersistence } from './hooks/use-wizard-persistence';

/**
 * View layer for the tenant creation wizard. State lives entirely in the
 * XState machine (`useTenantWizard`); this component is a thin event
 * dispatcher + step renderer. The phoneAcquisition step owns its own
 * child machine — see `phone-procurement.machine.ts`.
 *
 * Persistence is React-side: `useWizardPersistence` snapshots the machine
 * context to localStorage and surfaces the resume banner. Resume sends
 * `RESUME_DRAFT` to the machine, which hydrates context and jumps to the
 * draft's step. Start-over fires `START_OVER` and clears the saved draft.
 */
export function TenantWizardView() {
  const t = useTranslations('tenantWizard');
  const router = useRouter();
  const { user } = useAuth();

  const wizard = useTenantWizard();
  const {
    send,
    step,
    wizardState,
    isSubmitting,
    isDone,
    error,
    partialFailures,
    tenantId,
    phoneProcurementDeps,
  } = wizard;

  const usage = useWizardUsage();
  const persistence = useWizardPersistence(wizardState, user?.id ?? null);

  // Single navigation effect on `done` — keeps the wizard machine
  // unaware of routing, and the view doesn't need to drive a side
  // effect inside an event handler.
  useEffect(() => {
    if (isDone && tenantId) {
      persistence.clearDraft();
      router.push('/');
    }
  }, [isDone, tenantId, persistence, router]);

  const goHome = () => router.push('/');

  const resumeDraft = () => {
    const draft = persistence.loadDraft();
    if (!draft) return;
    send({ type: 'RESUME_DRAFT', draft });
  };

  const startOver = () => {
    persistence.clearDraft();
    send({ type: 'START_OVER' });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-text">{t('title')}</h1>
        <p className="text-sm text-muted mt-1">
          {t('subtitle', { name: wizardState.name || wizardState.slug || t('yourTenant') })}
        </p>
      </header>

      <WizardStepper current={step} steps={WIZARD_STEPS} />

      {persistence.hasDraft && (
        <div className="bg-blue-500/5 border border-blue-500/40 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-blue-500">
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
          <ul className="text-xs text-amber-600 mt-1 list-disc list-inside">
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
          defaultSlug={wizardState.slug}
          defaultName={wizardState.name}
          onCancel={goHome}
          onNext={(values) => send({ type: 'BASICS_NEXT', slug: values.slug, name: values.name })}
        />
      )}

      {step === 'features' && (
        <StepFeatures
          defaultFeatures={wizardState.features}
          onBack={(features) => send({ type: 'FEATURES_BACK', features })}
          onNext={(features) => send({ type: 'FEATURES_NEXT', features })}
        />
      )}

      {step === 'phoneAcquisition' && (
        <StepPhoneAcquisition
          defaultStrategy={wizardState.phoneStrategy}
          phoneNumbersIncluded={usage.phoneNumbersIncluded}
          messagesPerMonthIncluded={usage.messagesPerMonthIncluded}
          pricePerExtraMessageCents={usage.pricePerExtraMessageCents}
          currency={usage.currency}
          deps={phoneProcurementDeps}
          onBack={() => send({ type: 'PHONE_ACQUISITION_BACK' })}
          onDone={(phoneStrategy) => send({ type: 'PHONE_ACQUISITION_DONE', phoneStrategy })}
        />
      )}

      {step === 'platforms' && (
        <StepPlatforms
          defaultPlatforms={wizardState.platforms}
          maxPlatforms={usage.maxPlatformsPerTenant}
          managedPhone={
            wizardState.phoneStrategy.mode === 'managed'
              ? wizardState.phoneStrategy.purchasedPhoneE164
              : undefined
          }
          onBack={(platforms) => send({ type: 'PLATFORMS_BACK', platforms })}
          onNext={(platforms) => send({ type: 'PLATFORMS_NEXT', platforms })}
        />
      )}

      {step === 'commands' && (
        <StepCommands
          defaultCommands={wizardState.customCommands}
          maxCommands={usage.maxCustomCommandsPerTenant}
          onBack={(customCommands) => send({ type: 'COMMANDS_BACK', customCommands })}
          onNext={(customCommands) => send({ type: 'COMMANDS_NEXT', customCommands })}
        />
      )}

      {step === 'contacts' && (
        <StepContacts
          defaultContacts={wizardState.contacts}
          isSubmitting={isSubmitting}
          error={error}
          onBack={(contacts) => send({ type: 'CONTACTS_BACK', contacts })}
          onFinish={(contacts) => send({ type: 'CONTACTS_FINISH', contacts })}
        />
      )}
    </div>
  );
}
