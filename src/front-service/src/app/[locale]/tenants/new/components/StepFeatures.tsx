'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Toggle } from '@/components/ui';
import { FEATURE_KEYS } from '../constants';
import type { TenantFeaturesDraft } from '../interfaces';

interface StepFeaturesProps {
  defaultFeatures: TenantFeaturesDraft;
  onBack: (features: TenantFeaturesDraft) => void;
  onNext: (features: TenantFeaturesDraft) => void;
}

export function StepFeatures({ defaultFeatures, onBack, onNext }: StepFeaturesProps) {
  const t = useTranslations('tenantWizard');
  const tFeat = useTranslations('tenantFeatures');
  const [draft, setDraft] = useState<TenantFeaturesDraft>(defaultFeatures);

  const toggle = (key: keyof TenantFeaturesDraft) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text">{t('stepFeaturesTitle')}</h2>
      <p className="text-sm text-muted">{t('stepFeaturesDesc')}</p>

      <div className="flex flex-col gap-2">
        {FEATURE_KEYS.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between bg-surface-raised border border-border rounded-xl px-4 py-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">
                {tFeat(`${key}.title` as Parameters<typeof tFeat>[0])}
              </span>
              <span className="text-xs text-muted">
                {tFeat(`${key}.description` as Parameters<typeof tFeat>[0])}
              </span>
            </div>
            <Toggle checked={draft[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={() => onBack(draft)}>
          {t('back')}
        </Button>
        <Button type="button" variant="blue" onClick={() => onNext(draft)}>
          {t('next')}
        </Button>
      </div>
    </div>
  );
}
