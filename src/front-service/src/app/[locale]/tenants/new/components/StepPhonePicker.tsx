'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { usePhoneProcurementInfo } from '../hooks/use-phone-procurement-info';
import type { PickerStatus } from '../hooks/use-tenant-wizard';
import type { AvailablePhoneNumber } from '../tenant-wizard.machine';
import type { PhoneStrategyDraft } from '../interfaces';

interface StepPhonePickerProps {
  /** Strategy from machine context — read-only here, drives the purchased panel render. */
  strategy: PhoneStrategyDraft;
  /** Available numbers list, fetched by the machine actor. */
  numbers: AvailablePhoneNumber[];
  /** Currently selected E.164 (pre-purchase) — `null` until user picks. */
  selected: string | null;
  /** Error from the latest list/purchase attempt — surfaces as a red banner. */
  error: string | null;
  /** Picker substate — drives loading skeleton / purchase progress / cancel disabled state. */
  status: PickerStatus;
  onBack: () => void;
  onNext: () => void;
  onSelect: (phoneE164: string) => void;
  onRefresh: () => void;
  onBuy: () => void;
  onCancelPurchase: () => void;
}

/**
 * Pure render of the picker step — all data and async work live in the
 * tenantWizard XState machine. Component dispatches events; the machine
 * decides whether they're allowed (e.g. BUY only when something is
 * selected, NEXT only after purchase).
 *
 * Capability filter (SMS-capable only) lives here because it's a render
 * concern: the BFF returns whatever Twilio gave us, and Signal needs
 * SMS to receive the verification code.
 */
export function StepPhonePicker({
  strategy,
  numbers,
  selected,
  error,
  status,
  onBack,
  onNext,
  onSelect,
  onRefresh,
  onBuy,
  onCancelPurchase,
}: StepPhonePickerProps) {
  const t = useTranslations('tenantWizard');
  const info = usePhoneProcurementInfo();

  const smsCapable = numbers.filter((n) => n.capabilities.sms);
  const isLoading = status === 'loading';
  const isPurchasing = status === 'purchasing';
  const isReleasing = status === 'releasing';
  const isPurchased = status === 'purchased';
  const purchasedPhone = strategy.purchasedPhoneE164;

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

      {isPurchased ? (
        <div className="bg-emerald-500/5 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-emerald-200">
            {t('phonePicker_purchased_title', { phone: purchasedPhone ?? '' })}
          </p>
          <p className="text-xs text-emerald-200/80">{t('phonePicker_purchased_body')}</p>
          <div>
            <Button type="button" variant="green" disabled={isReleasing} onClick={onCancelPurchase}>
              {isReleasing ? t('phonePicker_cancelling') : t('phonePicker_cancelPurchase')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">{t('phonePicker_listHint', { count: smsCapable.length })}</p>
            <Button type="button" variant="green" disabled={isLoading || isPurchasing} onClick={onRefresh}>
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
                onSelect={() => onSelect(n.phoneE164)}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/40 rounded-xl p-3">
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" disabled={isPurchasing || isReleasing} onClick={onBack}>
          {t('back')}
        </Button>
        {isPurchased ? (
          <Button type="button" variant="blue" onClick={onNext}>
            {t('next')}
          </Button>
        ) : (
          <Button type="button" variant="blue" disabled={!selected || isPurchasing} onClick={onBuy}>
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
