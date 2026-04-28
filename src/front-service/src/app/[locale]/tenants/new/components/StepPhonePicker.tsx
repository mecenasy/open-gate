'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { usePhoneProcurementInfo } from '../hooks/use-phone-procurement-info';
import { useAvailablePhoneNumbers, type AvailablePhoneNumber } from '../hooks/use-available-phone-numbers';
import { usePurchasePhoneNumber } from '../hooks/use-purchase-phone-number';
import { useReleasePendingPurchase } from '../hooks/use-release-pending-purchase';
import type { PhoneStrategyDraft } from '../interfaces';

interface StepPhonePickerProps {
  defaultStrategy: PhoneStrategyDraft;
  /** ISO 3166-1 alpha-2 — defaults to PL (we only seeded a regulatory bundle for Poland). */
  country?: string;
  onBack: (draft: PhoneStrategyDraft) => void;
  onNext: (draft: PhoneStrategyDraft) => void;
}

/**
 * Shows ten available numbers, lets the user pick one, then buys it via
 * the BFF mutation. After a successful purchase we hold the pending row
 * in the wizard state — actual binding to the tenant happens at submit
 * time. The cleanup cron releases anything left unattached for >24h.
 *
 * Capability filter: only SMS-capable numbers are surfaced. Signal
 * registration sends the verification code over SMS, so a voice-only
 * number would dead-end the managed flow.
 *
 * The "Cancel purchase" button (cancelling an *already-purchased* row)
 * fires the release mutation and clears the wizard's pendingPurchaseId
 * so the user can pick a different number without a stranded row.
 */
export function StepPhonePicker({ defaultStrategy, country = 'PL', onBack, onNext }: StepPhonePickerProps) {
  const t = useTranslations('tenantWizard');
  const info = usePhoneProcurementInfo();
  const { numbers, isLoading, refetch } = useAvailablePhoneNumbers(country, 10);
  const { purchase, isPurchasing, error: purchaseError } = usePurchasePhoneNumber();
  const { release, isReleasing } = useReleasePendingPurchase();

  const [selected, setSelected] = useState<string | null>(null);
  const [purchasedPhone, setPurchasedPhone] = useState<string | undefined>(defaultStrategy.purchasedPhoneE164);
  const [pendingId, setPendingId] = useState<string | undefined>(defaultStrategy.pendingPurchaseId);

  const smsCapable = numbers.filter((n) => n.capabilities.sms);
  const hasPurchase = !!pendingId && !!purchasedPhone;

  const handlePurchase = async () => {
    if (!selected) return;
    const result = await purchase({ country, phoneE164: selected });
    if (!result) return;
    setPurchasedPhone(result.phoneE164);
    setPendingId(result.pendingId);
  };

  const handleCancelPurchase = async () => {
    if (!pendingId) return;
    await release(pendingId);
    setPurchasedPhone(undefined);
    setPendingId(undefined);
    setSelected(null);
  };

  const handleBack = () => {
    onBack({ ...defaultStrategy, purchasedPhoneE164: purchasedPhone, pendingPurchaseId: pendingId });
  };

  const handleNext = () => {
    if (!hasPurchase) return;
    onNext({ mode: 'managed', purchasedPhoneE164: purchasedPhone, pendingPurchaseId: pendingId });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('stepPhonePickerTitle')}</h2>
        <p className="text-sm text-muted">{t('stepPhonePickerDesc')}</p>
      </div>

      {info.isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/40 rounded-xl p-3">
          <p className="text-xs text-amber-200">{t('phonePicker_sandboxBanner')}</p>
        </div>
      )}

      {hasPurchase ? (
        <div className="bg-emerald-500/5 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-emerald-200">
            {t('phonePicker_purchased_title', { phone: purchasedPhone ?? '' })}
          </p>
          <p className="text-xs text-emerald-200/80">{t('phonePicker_purchased_body')}</p>
          <div>
            <Button type="button" variant="green" disabled={isReleasing} onClick={handleCancelPurchase}>
              {isReleasing ? t('phonePicker_cancelling') : t('phonePicker_cancelPurchase')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">{t('phonePicker_listHint', { count: smsCapable.length })}</p>
            <Button type="button" variant="green" disabled={isLoading} onClick={() => void refetch()}>
              {isLoading ? t('phonePicker_loading') : t('phonePicker_refresh')}
            </Button>
          </div>

          {isLoading && smsCapable.length === 0 && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="bg-surface-raised border border-border rounded-xl h-12 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && smsCapable.length === 0 && (
            <p className="text-sm text-muted">{t('phonePicker_empty')}</p>
          )}

          <div className="grid grid-cols-1 gap-2">
            {smsCapable.map((n) => (
              <PhoneOption
                key={n.phoneE164}
                number={n}
                selected={selected === n.phoneE164}
                onSelect={() => setSelected(n.phoneE164)}
              />
            ))}
          </div>

          {purchaseError && (
            <div className="bg-red-500/5 border border-red-500/40 rounded-xl p-3">
              <p className="text-xs text-red-200">{purchaseError}</p>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" disabled={isPurchasing} onClick={handleBack}>
          {t('back')}
        </Button>
        {hasPurchase ? (
          <Button type="button" variant="blue" onClick={handleNext}>
            {t('next')}
          </Button>
        ) : (
          <Button type="button" variant="blue" disabled={!selected || isPurchasing} onClick={handlePurchase}>
            {isPurchasing ? t('phonePicker_purchasing') : t('phonePicker_buy')}
          </Button>
        )}
      </div>
    </div>
  );
}

interface PhoneOptionProps {
  number: AvailablePhoneNumber;
  selected: boolean;
  onSelect: () => void;
}

function PhoneOption({ number, selected, onSelect }: PhoneOptionProps) {
  const t = useTranslations('tenantWizard');
  const region = number.region || '';
  const locality = number.locality || '';
  const place = [locality, region].filter(Boolean).join(', ');
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'text-left rounded-xl border-2 px-4 py-3 flex items-center justify-between gap-3 transition-colors',
        selected ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-surface-raised hover:border-blue-500/40',
      ].join(' ')}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text">{number.phoneE164}</span>
        {place && <span className="text-xs text-muted">{place}</span>}
      </div>
      <div className="flex gap-1.5 text-[10px] uppercase tracking-wide font-semibold">
        {number.capabilities.sms && (
          <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded px-1.5 py-0.5">
            {t('phonePicker_cap_sms')}
          </span>
        )}
        {number.capabilities.mms && (
          <span className="bg-blue-500/15 text-blue-300 border border-blue-500/40 rounded px-1.5 py-0.5">
            {t('phonePicker_cap_mms')}
          </span>
        )}
        {number.capabilities.voice && (
          <span className="bg-purple-500/15 text-purple-300 border border-purple-500/40 rounded px-1.5 py-0.5">
            {t('phonePicker_cap_voice')}
          </span>
        )}
      </div>
    </button>
  );
}
