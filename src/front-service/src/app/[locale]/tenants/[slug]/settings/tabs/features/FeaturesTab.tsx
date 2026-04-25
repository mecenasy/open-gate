'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Toggle } from '@/components/ui';
import { FEATURE_KEYS } from '../../constants';
import { useUpdateFeatures } from '../../hooks/use-update-features';
import type { TenantFeaturesForm } from '../../interfaces';

interface FeaturesTabProps {
  tenantId: string;
  features: TenantFeaturesForm;
}

export function FeaturesTab({ tenantId, features }: FeaturesTabProps) {
  const t = useTranslations('tenantSettings.features');
  const tCommon = useTranslations('tenantSettings.common');
  const tFeat = useTranslations('tenantFeatures');
  const { save, isSaving } = useUpdateFeatures(tenantId);

  const [draft, setDraft] = useState<TenantFeaturesForm>(features);

  const dirty = JSON.stringify(draft) !== JSON.stringify(features);

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <p className="text-sm text-muted">{t('desc')}</p>
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
            <Toggle
              checked={draft[key]}
              onChange={(value) => setDraft((prev) => ({ ...prev, [key]: value }))}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="blue"
          disabled={!dirty || isSaving}
          onClick={() => void save(draft)}
        >
          {isSaving ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>
    </div>
  );
}
