'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useMachine } from '@xstate/react';
import { Button } from '@/components/ui';
import { formatCents } from '../helpers';
import { usePhoneProcurementInfo } from '../hooks/use-phone-procurement-info';
import {
  phoneProcurementMachine,
  type AvailablePhoneNumber,
  type PhoneProcurementDeps,
  type PhoneProcurementOutput,
} from '../phone-procurement.machine';
import type { PhoneStrategyDraft } from '../interfaces';

interface StepPhoneAcquisitionProps {
  /** Hydrates the procurement machine on mount/remount. */
  defaultStrategy: PhoneStrategyDraft;
  /** Plan-derived facts shown in the managed-tile copy. */
  phoneNumbersIncluded: number;
  messagesPerMonthIncluded: number;
  pricePerExtraMessageCents: number;
  currency: string;
  /** Apollo bridge for the procurement machine — listAvailable / buy / release. */
  deps: PhoneProcurementDeps;
  onBack: () => void;
  onDone: (strategy: PhoneStrategyDraft) => void;
}

/**
 * Combined strategy + picker step. Owns its own state machine
 * (`phoneProcurementMachine`) so the parent wizard machine can stay thin —
 * the parent only sees BACK and DONE.
 *
 * Sub-views by `state.value`:
 *   - chooseMode  → radio tiles (managed / self)
 *   - self        → confirmation + Confirm button
 *   - managed.loading / idle / purchasing → list with skeleton/buy
 *   - managed.purchased → "your number is X" + Confirm/Cancel
 *   - managed.releasing → cancel-in-flight, panel disabled
 */
export function StepPhoneAcquisition({
  defaultStrategy,
  phoneNumbersIncluded,
  messagesPerMonthIncluded,
  pricePerExtraMessageCents,
  currency,
  deps,
  onBack,
  onDone,
}: StepPhoneAcquisitionProps) {
  const t = useTranslations('tenantWizard');
  const info = usePhoneProcurementInfo();
  const machine = useMemo(() => phoneProcurementMachine(deps), [deps]);
  const [state, send] = useMachine(machine, { input: { initialStrategy: defaultStrategy } });

  // Fire onDone once when the machine reaches its final state. Guarded by
  // a ref so React StrictMode's double-mount in dev doesn't fire it
  // twice (which would advance the wizard past phoneAcquisition twice
  // and leave the wizard in a broken state).
  const firedDoneRef = useRef(false);
  useEffect(() => {
    if (state.status !== 'done' || firedDoneRef.current) return;
    firedDoneRef.current = true;
    const output = state.output as PhoneProcurementOutput | undefined;
    if (!output) return;
    onDone({
      mode: output.mode,
      purchasedPhoneE164: output.purchasedPhoneE164,
      pendingPurchaseId: output.pendingPurchaseId,
    });
  }, [state, onDone]);

  const isChoose = state.matches('chooseMode');
  const isSelf = state.matches('self');
  const isManaged = state.matches('managed');
  const managedSubstate = isManaged ? (state.value as { managed: string }).managed : null;
  const isLoading = managedSubstate === 'loading';
  const isPurchasing = managedSubstate === 'purchasing';
  const isReleasing = managedSubstate === 'releasing';
  const isPurchased = managedSubstate === 'purchased';

  const overageRate = formatCents(pricePerExtraMessageCents, currency, t('phoneStrategy_overage_free'));
  const managedAvailable = phoneNumbersIncluded > 0;

  const numbers = state.context.numbers;
  const selected = state.context.selected;
  const error = state.context.error;
  const purchasedPhone = state.context.purchasedPhoneE164;
  const smsCapable = numbers.filter((n) => n.capabilities.sms);

  return (
    <div className="flex flex-col gap-4">
      {isChoose && (
        <ChooseMode
          managedAvailable={managedAvailable}
          messagesPerMonthIncluded={messagesPerMonthIncluded}
          overageRate={overageRate}
          onChooseManaged={() => send({ type: 'CHOOSE_MANAGED' })}
          onChooseSelf={() => send({ type: 'CHOOSE_SELF' })}
        />
      )}

      {isSelf && <SelfConfirm />}

      {isManaged && (
        <ManagedPanel
          isSandbox={info.isSandbox}
          isLoading={isLoading}
          isPurchasing={isPurchasing}
          isReleasing={isReleasing}
          isPurchased={isPurchased}
          purchasedPhone={purchasedPhone}
          numbers={smsCapable}
          selected={selected}
          error={error}
          onSelect={(phoneE164) => send({ type: 'SELECT', phoneE164 })}
          onRefresh={() => send({ type: 'REFRESH' })}
          onCancelPurchase={() => send({ type: 'CANCEL_PURCHASE' })}
        />
      )}

      <div className="flex justify-between pt-4">
        {isChoose ? (
          <Button type="button" variant="green" onClick={onBack}>
            {t('back')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="green"
            disabled={isPurchasing || isReleasing}
            onClick={() => send({ type: 'BACK_TO_CHOOSE' })}
          >
            {t('back')}
          </Button>
        )}
        {isChoose ? (
          <span />
        ) : isManaged && !isPurchased ? (
          <Button
            type="button"
            variant="blue"
            disabled={!selected || isPurchasing}
            onClick={() => send({ type: 'BUY' })}
          >
            {isPurchasing ? t('phonePicker_purchasing') : t('phonePicker_buy')}
          </Button>
        ) : (
          <Button type="button" variant="blue" onClick={() => send({ type: 'CONFIRM' })}>
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
}

interface ChooseModeProps {
  managedAvailable: boolean;
  messagesPerMonthIncluded: number;
  overageRate: string;
  onChooseManaged: () => void;
  onChooseSelf: () => void;
}

function ChooseMode({
  managedAvailable,
  messagesPerMonthIncluded,
  overageRate,
  onChooseManaged,
  onChooseSelf,
}: ChooseModeProps) {
  const t = useTranslations('tenantWizard');
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('stepPhoneAcquisitionTitle')}</h2>
        <p className="text-sm text-muted">{t('stepPhoneAcquisitionDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!managedAvailable}
          onClick={() => managedAvailable && onChooseManaged()}
          className={tileClasses(false, !managedAvailable, true)}
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
          {!managedAvailable && <p className="text-xs text-amber-400 mt-2">{t('phoneStrategy_managed_unavailable')}</p>}
        </button>

        <button type="button" onClick={onChooseSelf} className={tileClasses(false, false, false)}>
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
        <p className="text-xs text-blue-500 leading-relaxed">{t('phoneStrategy_costs_disclaimer')}</p>
      </div>
    </>
  );
}

function SelfConfirm() {
  const t = useTranslations('tenantWizard');
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('phoneStrategy_self_title')}</h2>
        <p className="text-sm text-muted">{t('phoneStrategy_self_summary')}</p>
        <a
          href="https://www.twilio.com/docs/phone-numbers/regulatory/getting-started/poland"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline mt-1 inline-block"
        >
          {t('phoneStrategy_self_link')}
        </a>
      </div>
    </>
  );
}

interface ManagedPanelProps {
  isSandbox: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isReleasing: boolean;
  isPurchased: boolean;
  purchasedPhone?: string;
  numbers: AvailablePhoneNumber[];
  selected: string | null;
  error: string | null;
  onSelect: (phoneE164: string) => void;
  onRefresh: () => void;
  onCancelPurchase: () => void;
}

function ManagedPanel({
  isSandbox,
  isLoading,
  isPurchasing,
  isReleasing,
  isPurchased,
  purchasedPhone,
  numbers,
  selected,
  error,
  onSelect,
  onRefresh,
  onCancelPurchase,
}: ManagedPanelProps) {
  const t = useTranslations('tenantWizard');
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('stepPhonePickerTitle')}</h2>
        <p className="text-sm text-muted">{t('stepPhonePickerDesc')}</p>
      </div>

      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/40 rounded-xl p-3">
          <p className="text-xs text-amber-600">{t('phonePicker_sandboxBanner')}</p>
        </div>
      )}

      {isPurchased ? (
        <div className="bg-emerald-500/5 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-emerald-200">
            {t('phonePicker_purchased_title', { phone: purchasedPhone ?? '' })}
          </p>
          <p className="text-xs text-emerald-600/80">{t('phonePicker_purchased_body')}</p>
          <div>
            <Button type="button" variant="green" disabled={isReleasing} onClick={onCancelPurchase}>
              {isReleasing ? t('phonePicker_cancelling') : t('phonePicker_cancelPurchase')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">{t('phonePicker_listHint', { count: numbers.length })}</p>
            <Button type="button" variant="green" disabled={isLoading || isPurchasing} onClick={onRefresh}>
              {isLoading ? t('phonePicker_loading') : t('phonePicker_refresh')}
            </Button>
          </div>

          {isLoading && numbers.length === 0 && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="bg-surface-raised border border-border rounded-xl h-12 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && numbers.length === 0 && <p className="text-sm text-muted">{t('phonePicker_empty')}</p>}

          <div className="grid grid-cols-1 gap-2">
            {numbers.map((n) => (
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
    </>
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
