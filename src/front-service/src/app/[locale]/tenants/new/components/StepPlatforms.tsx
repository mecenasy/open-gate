'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Toggle } from '@/components/ui';
import type { PlatformDraft } from '../interfaces';
import { StepBudget } from './StepBudget';
import {
  PLATFORM_KEYS,
  emptyPlatformsState,
  type PlatformConfigState,
  type PlatformKey,
  type PlatformsState,
} from './platforms/platform-fields';
import { PlatformConfigModal } from './platforms/PlatformConfigModal';

interface StepPlatformsProps {
  defaultPlatforms: PlatformDraft[];
  maxPlatforms: number;
  onBack: (drafts: PlatformDraft[]) => void;
  onNext: (drafts: PlatformDraft[]) => void;
}

/**
 * Hydrates the wizard state from a previous run's PlatformDraft[]. A
 * draft survives Back/Next, so re-entering the step shows what the user
 * already saved — including disabled-with-config (config preserved when
 * toggle was turned off).
 */
function hydrate(drafts: PlatformDraft[]): PlatformsState {
  const state = emptyPlatformsState();
  for (const d of drafts) {
    if (!(d.platform in state)) continue;
    let parsed: Record<string, unknown> | null = null;
    if (d.configJson) {
      try {
        parsed = JSON.parse(d.configJson) as Record<string, unknown>;
      } catch {
        parsed = null;
      }
    }
    state[d.platform as PlatformKey] = {
      enabled: parsed !== null,
      config: parsed,
    };
  }
  return state;
}

function toDrafts(state: PlatformsState): PlatformDraft[] {
  // Persist *both* enabled and disabled-with-config tiles so re-entering
  // the step preserves "I configured this but turned it off" intent.
  // The wizard submit hook filters down to enabled ones with non-null
  // config when calling upsertPlatformCredentials.
  const drafts: PlatformDraft[] = [];
  for (const p of PLATFORM_KEYS) {
    const slot = state[p];
    if (!slot.config) continue;
    drafts.push({
      platform: p,
      configJson: slot.enabled ? JSON.stringify(slot.config) : '',
    });
  }
  return drafts;
}

export function StepPlatforms({ defaultPlatforms, maxPlatforms, onBack, onNext }: StepPlatformsProps) {
  const t = useTranslations('tenantWizard');

  const [state, setState] = useState<PlatformsState>(() => hydrate(defaultPlatforms));
  const [editing, setEditing] = useState<PlatformKey | null>(null);

  const enabledCount = PLATFORM_KEYS.filter((p) => state[p].enabled).length;
  const overLimit = enabledCount > maxPlatforms;

  const setSlot = (platform: PlatformKey, slot: PlatformConfigState) => {
    setState((prev) => ({ ...prev, [platform]: slot }));
  };

  const handleToggle = (platform: PlatformKey, value: boolean) => {
    const slot = state[platform];
    if (value && !slot.config) {
      // Trying to enable a never-configured platform — open the modal
      // instead of silently flipping to a useless "enabled but empty" state.
      setEditing(platform);
      return;
    }
    setSlot(platform, { ...slot, enabled: value });
  };

  const handleSave = (platform: PlatformKey, config: Record<string, unknown>) => {
    setSlot(platform, { enabled: true, config });
    setEditing(null);
  };

  const handleNext = () => {
    onNext(
      PLATFORM_KEYS.flatMap((p) => {
        const slot = state[p];
        return slot.enabled && slot.config
          ? [{ platform: p, configJson: JSON.stringify(slot.config) }]
          : [];
      }),
    );
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PLATFORM_KEYS.map((platform) => {
          const slot = state[platform];
          const configured = slot.config !== null;
          const status = !configured ? 'off' : slot.enabled ? 'active' : 'paused';
          return (
            <div
              key={platform}
              className={[
                'bg-surface-raised border rounded-xl p-4 flex flex-col gap-3 transition-colors',
                status === 'active'
                  ? 'border-emerald-500/40'
                  : status === 'paused'
                    ? 'border-amber-500/30'
                    : 'border-border',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setEditing(platform)}
                className="flex items-start justify-between gap-3 text-left"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-text">
                    {t(`platform_${platform}` as Parameters<typeof t>[0])}
                  </span>
                  <span
                    className={[
                      'text-xs',
                      status === 'active'
                        ? 'text-emerald-400'
                        : status === 'paused'
                          ? 'text-amber-400'
                          : 'text-muted',
                    ].join(' ')}
                  >
                    {t(`platformStatus_${status}` as Parameters<typeof t>[0])}
                  </span>
                </div>
                <span className="text-xs text-blue-400 shrink-0 self-end">
                  {configured ? t('platformEdit') : t('platformConfigure')}
                </span>
              </button>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted">{t('platformEnableLabel')}</span>
                <Toggle
                  checked={slot.enabled}
                  onChange={(value) => handleToggle(platform, value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={() => onBack(toDrafts(state))}>
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

      <PlatformConfigModal
        isOpen={editing !== null}
        platform={editing}
        defaultConfig={editing ? state[editing].config : null}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}
