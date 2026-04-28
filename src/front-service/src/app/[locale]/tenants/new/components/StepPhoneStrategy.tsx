'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { formatCents } from '../helpers';
import type { PhoneStrategyDraft, PhoneStrategyMode } from '../interfaces';

interface StepPhoneStrategyProps {
  defaultStrategy: PhoneStrategyDraft;
  /** Plan-derived facts shown in the managed-tile copy. */
  phoneNumbersIncluded: number;
  messagesPerMonthIncluded: number;
  pricePerExtraMessageCents: number;
  currency: string;
  onBack: (draft: PhoneStrategyDraft) => void;
  onNext: (draft: PhoneStrategyDraft) => void;
}

/**
 * Decision step: managed (we procure the number) vs self (user brings
 * their own Twilio). Two large radio-tile cards rather than a toggle —
 * the choice is one-shot with diverging consequences, not a setting that
 * gets flipped later.
 *
 * The managed tile is disabled when the user's plan doesn't include any
 * phone numbers (minimal plan); copy points at the upgrade.
 *
 * Both tiles start unselected so "Next" stays inactive until the user
 * actively picks — silent defaults are easy to walk past.
 */
export function StepPhoneStrategy({
  defaultStrategy,
  phoneNumbersIncluded,
  messagesPerMonthIncluded,
  pricePerExtraMessageCents,
  currency,
  onBack,
  onNext,
}: StepPhoneStrategyProps) {
  const t = useTranslations('tenantWizard');
  const [mode, setMode] = useState<PhoneStrategyMode | null>(defaultStrategy.mode);

  const managedAvailable = phoneNumbersIncluded > 0;
  const overageRate = formatCents(pricePerExtraMessageCents, currency, t('phoneStrategy_overage_free'));

  const handleNext = () => {
    if (!mode) return;
    // Mode flip wipes the picker state — a switch from managed to self
    // mid-wizard means the previously held pendingPurchase no longer
    // applies. The picker step is responsible for re-issuing it.
    if (mode !== defaultStrategy.mode) {
      onNext({ mode });
      return;
    }
    onNext({ ...defaultStrategy, mode });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('stepPhoneStrategyTitle')}</h2>
        <p className="text-sm text-muted">{t('stepPhoneStrategyDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!managedAvailable}
          onClick={() => managedAvailable && setMode('managed')}
          className={tileClasses(mode === 'managed', !managedAvailable, true)}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text">{t('phoneStrategy_managed_title')}</span>
            <span className="text-[10px] uppercase tracking-wide font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 rounded px-1.5 py-0.5">
              {t('phoneStrategy_recommended')}
            </span>
          </div>
          <p className="text-xs text-muted mt-2">
            {t('phoneStrategy_managed_summary', { messages: messagesPerMonthIncluded, overage: overageRate })}
          </p>
          {!managedAvailable && (
            <p className="text-xs text-amber-400 mt-2">{t('phoneStrategy_managed_unavailable')}</p>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMode('self')}
          className={tileClasses(mode === 'self', false, false)}
        >
          <span className="text-sm font-semibold text-text">{t('phoneStrategy_self_title')}</span>
          <p className="text-xs text-muted mt-2">{t('phoneStrategy_self_summary')}</p>
          <a
            href="https://www.twilio.com/docs/phone-numbers/regulatory/getting-started/poland"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-400 hover:underline mt-2 inline-block"
          >
            {t('phoneStrategy_self_link')}
          </a>
        </button>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/30 rounded-xl p-3">
        <p className="text-xs text-blue-200 leading-relaxed">{t('phoneStrategy_costs_disclaimer')}</p>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={() => onBack({ ...defaultStrategy, mode })}>
          {t('back')}
        </Button>
        <Button type="button" variant="blue" disabled={!mode} onClick={handleNext}>
          {t('next')}
        </Button>
      </div>
    </div>
  );
}

function tileClasses(selected: boolean, disabled: boolean, recommended: boolean): string {
  const base = 'text-left rounded-xl border-2 px-4 py-4 flex flex-col transition-colors';
  if (disabled) {
    return [base, 'border-border/40 bg-surface-raised/40 cursor-not-allowed opacity-60'].join(' ');
  }
  if (selected) {
    return [base, 'border-blue-500 bg-blue-500/10'].join(' ');
  }
  return [
    base,
    recommended
      ? 'border-emerald-500/40 bg-surface-raised hover:border-emerald-500/60'
      : 'border-border bg-surface-raised hover:border-blue-500/40',
  ].join(' ');
}
