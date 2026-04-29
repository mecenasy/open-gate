'use client';

import { useTranslations } from 'next-intl';
import type { WizardStepKey } from '../interfaces';

interface WizardStepperProps {
  current: WizardStepKey;
  /** The full step list. After collapsing strategy + picker into one
   * `phoneAcquisition` step, this is a single linear list — same for
   * managed and self flows. */
  steps: WizardStepKey[];
}

const STEP_LABEL_KEYS: Record<WizardStepKey, string> = {
  basics: 'stepBasicsLabel',
  features: 'stepFeaturesLabel',
  phoneAcquisition: 'stepPhoneAcquisitionLabel',
  platforms: 'stepPlatformsLabel',
  commands: 'stepCommandsLabel',
  contacts: 'stepContactsLabel',
};

export function WizardStepper({ current, steps }: WizardStepperProps) {
  const t = useTranslations('tenantWizard');
  const currentIdx = steps.indexOf(current);

  return (
    <ol className="flex flex-wrap items-center gap-2 mb-6">
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={[
                'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold border',
                done
                  ? 'bg-green-500/15 text-green-400 border-green-500/40'
                  : active
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                    : 'bg-surface-raised text-muted border-border',
              ].join(' ')}
            >
              {idx + 1}
            </span>
            <span className={active ? 'text-text text-sm' : 'text-muted text-sm'}>
              {t(STEP_LABEL_KEYS[step] as Parameters<typeof t>[0])}
            </span>
            {idx < steps.length - 1 && <span className="w-6 h-px bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
