'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Modal } from '@/components/ui';
import { formatPrice, formatPriceDelta } from '../helpers';
import type { PlanChangePreview, PlanSummary, SubscriptionSummary } from '../interfaces';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: PlanSummary[];
  subscription: SubscriptionSummary | null;
  preview: PlanChangePreview | null;
  isPreviewLoading: boolean;
  isSaving: boolean;
  onPlanSelect: (planId: string) => void;
  onConfirm: () => void;
  selectedPlanId: string | null;
}

export function ChangePlanModal({
  isOpen,
  onClose,
  plans,
  subscription,
  preview,
  isPreviewLoading,
  isSaving,
  onPlanSelect,
  onConfirm,
  selectedPlanId,
}: ChangePlanModalProps) {
  const t = useTranslations('billing');
  const [step, setStep] = useState<'pick' | 'confirm'>('pick');

  useEffect(() => {
    if (!isOpen) setStep('pick');
  }, [isOpen]);

  const blocked = preview?.kind === 'downgrade' && preview.violations.length > 0;
  const canConfirm = preview && !blocked && preview.kind !== 'same' && !isSaving;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('changePlanTitle')}
      footer={
        <div className="flex justify-between">
          <Button type="button" variant="green" onClick={onClose}>
            {t('cancel')}
          </Button>
          {step === 'pick' ? (
            <Button
              type="button"
              variant="blue"
              disabled={!selectedPlanId || isPreviewLoading}
              onClick={() => setStep('confirm')}
            >
              {t('next')}
            </Button>
          ) : (
            <Button type="button" variant="blue" disabled={!canConfirm} onClick={onConfirm}>
              {isSaving ? t('saving') : t('confirmChange')}
            </Button>
          )}
        </div>
      }
    >
      {step === 'pick' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan.id === plan.id;
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onPlanSelect(plan.id)}
                className={[
                  'text-left flex flex-col gap-2 p-4 rounded-xl border transition-colors',
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/40'
                    : isCurrent
                    ? 'bg-surface-raised border-emerald-500/40'
                    : 'bg-surface-raised border-border hover:border-blue-500/30',
                ].join(' ')}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-text">{plan.name}</span>
                  <span className="text-xs text-muted">{formatPrice(plan.priceCents, plan.currency)}</span>
                </div>
                <ul className="text-xs text-muted flex flex-col gap-0.5">
                  <li>{t('planMaxTenants', { count: plan.maxTenants })}</li>
                  <li>{t('planMaxStaff', { count: plan.maxStaffPerTenant })}</li>
                  <li>{t('planMaxPlatforms', { count: plan.maxPlatformsPerTenant })}</li>
                  <li>{t('planMaxContacts', { count: plan.maxContactsPerTenant })}</li>
                </ul>
                {isCurrent && (
                  <span className="text-xs text-emerald-400">{t('planCurrent')}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <ConfirmStep
          preview={preview}
          isLoading={isPreviewLoading}
          subscription={subscription}
        />
      )}
    </Modal>
  );
}

interface ConfirmStepProps {
  preview: PlanChangePreview | null;
  isLoading: boolean;
  subscription: SubscriptionSummary | null;
}

function ConfirmStep({ preview, isLoading, subscription }: ConfirmStepProps) {
  const t = useTranslations('billing');

  if (isLoading || !preview) {
    return <p className="text-sm text-muted">{t('loadingPreview')}</p>;
  }

  if (preview.kind === 'same') {
    return <p className="text-sm text-muted">{t('previewSame')}</p>;
  }

  const blocked = preview.kind === 'downgrade' && preview.violations.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{t(`kind_${preview.kind}`)}</span>
        <span className="text-sm font-mono text-text">
          {formatPriceDelta(preview.deltaPriceCents, preview.newPlan.currency)}
        </span>
      </header>

      <DiffTable currentPlan={subscription?.plan ?? preview.currentPlan ?? null} newPlan={preview.newPlan} />

      {blocked && (
        <section className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-red-400">{t('downgradeBlockedTitle')}</h3>
          <p className="text-xs text-muted">{t('downgradeBlockedDesc')}</p>
          <ul className="flex flex-col gap-1 text-xs">
            {preview.violations.map((v, idx) => (
              <li key={idx} className="font-mono text-red-300">
                {t(`violation_${v.kind}` as Parameters<typeof t>[0], {
                  current: v.current,
                  max: v.max,
                  tenantId: v.tenantId ?? '',
                })}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

interface DiffTableProps {
  currentPlan: PlanSummary | null;
  newPlan: PlanSummary;
}

function DiffTable({ currentPlan, newPlan }: DiffTableProps) {
  const t = useTranslations('billing');

  const fields: Array<{ label: string; key: keyof PlanSummary }> = [
    { label: t('limitTenants'), key: 'maxTenants' },
    { label: t('limitStaff'), key: 'maxStaffPerTenant' },
    { label: t('limitPlatforms'), key: 'maxPlatformsPerTenant' },
    { label: t('limitContacts'), key: 'maxContactsPerTenant' },
    { label: t('limitCustomCommands'), key: 'maxCustomCommandsPerTenant' },
  ];

  return (
    <div className="bg-surface-raised border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted">
          <tr>
            <th className="text-left px-3 py-2 font-medium">{t('limit')}</th>
            <th className="text-right px-3 py-2 font-medium">{t('current')}</th>
            <th className="text-right px-3 py-2 font-medium">{newPlan.name}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => {
            const cur = currentPlan ? Number(currentPlan[f.key]) : 0;
            const next = Number(newPlan[f.key]);
            const grew = next > cur;
            const shrank = next < cur;
            return (
              <tr key={f.key as string} className="border-t border-border">
                <td className="px-3 py-2 text-muted">{f.label}</td>
                <td className="px-3 py-2 text-right font-mono">{currentPlan ? cur : '—'}</td>
                <td
                  className={[
                    'px-3 py-2 text-right font-mono',
                    grew ? 'text-emerald-400' : shrank ? 'text-red-400' : 'text-text',
                  ].join(' ')}
                >
                  {next}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
