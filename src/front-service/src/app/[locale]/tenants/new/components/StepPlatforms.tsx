'use client';

import { useEffect, useState } from 'react';
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
import { SignalOnboardingFlow } from './platforms/signal/SignalOnboardingFlow';

interface StepPlatformsProps {
  defaultPlatforms: PlatformDraft[];
  maxPlatforms: number;
  /**
   * E.164 of the number bought in the picker step. When set:
   *   - SMS tile is auto-enabled with `provider: 'managed'` and `phone`
   *     prefilled; the user can't open its config or toggle it off.
   *   - Signal modal opens with `account` locked to this number and
   *     mode forced to 'register'. SMS verification arrives at the
   *     managed number; the verification bridge auto-fills the code.
   */
  managedPhone?: string;
  /**
   * Pending purchase ID — passed to the Signal onboarding flow so its
   * verifyCode step can poll for the auto-detected verification code.
   * Only meaningful in managed flow.
   */
  pendingPurchaseId?: string;
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

export function StepPlatforms({
  defaultPlatforms,
  maxPlatforms,
  managedPhone,
  onBack,
  onNext,
}: StepPlatformsProps) {
  const t = useTranslations('tenantWizard');

  const [state, setState] = useState<PlatformsState>(() => hydrate(defaultPlatforms));
  const [editing, setEditing] = useState<PlatformKey | null>(null);
  const [signalOnboarding, setSignalOnboarding] = useState(false);

  // Sync the managed SMS slot whenever managedPhone changes — covers
  // back-and-forth navigation from the picker step. The config carries
  // `provider: 'managed'` so the BFF resolver knows to merge sid/token
  // from the master row at submit time rather than expecting tenant-side
  // creds in this JSON.
  useEffect(() => {
    if (!managedPhone) return;
    setState((prev) => {
      const current = prev.sms.config as Record<string, unknown> | null;
      const same = current?.provider === 'managed' && current?.phone === managedPhone;
      if (same && prev.sms.enabled) return prev;
      return {
        ...prev,
        sms: {
          enabled: true,
          config: { provider: 'managed', phone: managedPhone },
        },
      };
    });
  }, [managedPhone]);

  const enabledCount = PLATFORM_KEYS.filter((p) => state[p].enabled).length;
  const overLimit = enabledCount > maxPlatforms;

  const setSlot = (platform: PlatformKey, slot: PlatformConfigState) => {
    setState((prev) => ({ ...prev, [platform]: slot }));
  };

  const isLockedManaged = (platform: PlatformKey): boolean =>
    !!managedPhone && platform === 'sms';

  const openConfig = (platform: PlatformKey) => {
    if (isLockedManaged(platform)) return;
    if (platform === 'signal') {
      setSignalOnboarding(true);
    } else {
      setEditing(platform);
    }
  };

  const handleToggle = (platform: PlatformKey, value: boolean) => {
    if (isLockedManaged(platform)) return;
    const slot = state[platform];
    if (value && !slot.config) {
      // Trying to enable a never-configured platform — open the right
      // configurator instead of silently flipping to "enabled but empty".
      openConfig(platform);
      return;
    }
    setSlot(platform, { ...slot, enabled: value });
  };

  const handleSignalDone = (credentialsJson: string) => {
    try {
      const config = JSON.parse(credentialsJson) as Record<string, unknown>;
      setSlot('signal', { enabled: true, config });
    } catch {
      // Server should always return valid JSON; if it doesn't there's no
      // reasonable fallback in the wizard (we'd be saving garbage).
    }
    setSignalOnboarding(false);
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
          const locked = isLockedManaged(platform);
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
                onClick={() => openConfig(platform)}
                disabled={locked}
                className={[
                  'flex items-start justify-between gap-3 text-left',
                  locked ? 'cursor-default' : '',
                ].join(' ')}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-text">
                    {t(`platform_${platform}` as Parameters<typeof t>[0])}
                  </span>
                  {locked ? (
                    <span className="text-xs text-emerald-400">
                      {t('platformStatus_managed', { phone: managedPhone ?? '' })}
                    </span>
                  ) : (
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
                  )}
                </div>
                {!locked && (
                  <span className="text-xs text-blue-400 shrink-0 self-end">
                    {configured ? t('platformEdit') : t('platformConfigure')}
                  </span>
                )}
              </button>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted">{t('platformEnableLabel')}</span>
                <Toggle
                  checked={slot.enabled}
                  disabled={locked}
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

      {signalOnboarding && (
        <SignalOnboardingFlow
          isOpen={signalOnboarding}
          intent="initial"
          defaults={{
            apiUrl: (state.signal.config?.apiUrl as string | undefined) ?? '',
            account: managedPhone ?? (state.signal.config?.account as string | undefined) ?? '',
            mode: 'register',
          }}
          lockMode={!!managedPhone}
          onClose={() => setSignalOnboarding(false)}
          onDone={handleSignalDone}
        />
      )}
    </div>
  );
}
