'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Textarea, Toggle } from '@/components/ui';
import { PLATFORM_KEYS } from '../constants';
import type { PlatformDraft } from '../interfaces';
import { StepBudget } from './StepBudget';

interface StepPlatformsProps {
  defaultPlatforms: PlatformDraft[];
  maxPlatforms: number;
  onBack: (drafts: PlatformDraft[]) => void;
  onNext: (drafts: PlatformDraft[]) => void;
}

export function StepPlatforms({ defaultPlatforms, maxPlatforms, onBack, onNext }: StepPlatformsProps) {
  const t = useTranslations('tenantWizard');

  const [drafts, setDrafts] = useState<PlatformDraft[]>(() =>
    PLATFORM_KEYS.map((p) => {
      const existing = defaultPlatforms.find((d) => d.platform === p);
      return existing ?? { platform: p, configJson: '' };
    }),
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const d of drafts) init[d.platform] = d.configJson.length > 0;
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const enabledCount = Object.values(enabled).filter(Boolean).length;
  const overLimit = enabledCount > maxPlatforms;

  const setConfig = (platform: string, configJson: string) => {
    setDrafts((prev) => prev.map((d) => (d.platform === platform ? { ...d, configJson } : d)));
    setErrors((prev) => ({ ...prev, [platform]: '' }));
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    const result: PlatformDraft[] = [];
    for (const d of drafts) {
      if (!enabled[d.platform]) continue;
      const trimmed = d.configJson.trim();
      if (!trimmed) {
        newErrors[d.platform] = t('errorJsonRequired');
        continue;
      }
      try {
        JSON.parse(trimmed);
      } catch {
        newErrors[d.platform] = t('errorJsonInvalid');
        continue;
      }
      result.push({ platform: d.platform, configJson: trimmed });
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onNext(result);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('stepPlatformsTitle')}</h2>
        <p className="text-sm text-muted">{t('stepPlatformsDesc')}</p>
        <StepBudget label={t('platformBudget')} current={enabledCount} max={maxPlatforms} />
        {overLimit && (
          <p className="text-xs text-amber-400">{t('platformLimitExceeded', { max: maxPlatforms })}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {drafts.map((d) => (
          <div
            key={d.platform}
            className="bg-surface-raised border border-border rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">{t(`platform_${d.platform}` as Parameters<typeof t>[0])}</span>
              <Toggle
                checked={enabled[d.platform] ?? false}
                onChange={(value) => setEnabled((prev) => ({ ...prev, [d.platform]: value }))}
              />
            </div>
            {enabled[d.platform] && (
              <>
                <Textarea
                  rows={4}
                  placeholder={t('platformConfigPlaceholder')}
                  value={d.configJson}
                  onChange={(e) => setConfig(d.platform, e.target.value)}
                />
                {errors[d.platform] && <span className="text-xs text-red-400">{errors[d.platform]}</span>}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={() => onBack(drafts.filter((d) => enabled[d.platform]))}>
          {t('back')}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="green" onClick={() => onNext([])}>
            {t('skip')}
          </Button>
          <Button type="button" variant="blue" disabled={overLimit} onClick={handleNext}>
            {t('next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
