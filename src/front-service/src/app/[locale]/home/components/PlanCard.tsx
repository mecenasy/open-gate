'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { formatPrice } from '../helpers';
import type { SubscriptionPlanSummary } from '../interfaces';

interface PlanCardProps {
  plan: SubscriptionPlanSummary;
  isCurrent: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isCurrent, isDisabled, onSelect }: PlanCardProps) {
  const t = useTranslations('home');

  return (
    <div
      className={[
        'flex flex-col gap-3 p-5 rounded-2xl border transition-colors',
        isCurrent ? 'bg-blue-500/10 border-blue-500/40' : 'bg-surface-raised border-border',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-text">{plan.name}</h3>
        <span className="text-sm text-muted">{formatPrice(plan.priceCents, plan.currency)}</span>
      </div>

      <ul className="flex flex-col gap-1 text-xs text-muted">
        <li>{t('planMaxTenants', { count: plan.maxTenants })}</li>
        <li>{t('planMaxPlatforms', { count: plan.maxPlatformsPerTenant })}</li>
        <li>{t('planMaxContacts', { count: plan.maxContactsPerTenant })}</li>
        <li>{t('planMaxStaff', { count: plan.maxStaffPerTenant })}</li>
        <li>{t('planMaxCustomCommands', { count: plan.maxCustomCommandsPerTenant })}</li>
      </ul>

      <Button
        type="button"
        variant={isCurrent ? 'green' : 'blue'}
        disabled={isDisabled || isCurrent}
        onClick={onSelect}
      >
        {isCurrent ? t('planCurrent') : t('planSelect')}
      </Button>
    </div>
  );
}
