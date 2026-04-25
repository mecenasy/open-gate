'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { formatPrice } from '../helpers';
import type { SubscriptionSummary } from '../interfaces';

interface CurrentPlanCardProps {
  subscription: SubscriptionSummary | null;
  onChangeClick: () => void;
  onCancelClick: () => void;
}

export function CurrentPlanCard({ subscription, onChangeClick, onCancelClick }: CurrentPlanCardProps) {
  const t = useTranslations('billing');

  if (!subscription) {
    return (
      <section className="bg-surface-raised border border-border rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-base font-semibold text-text">{t('noSubscriptionTitle')}</h2>
        <p className="text-sm text-muted">{t('noSubscriptionDesc')}</p>
        <Button type="button" variant="blue" onClick={onChangeClick}>
          {t('choosePlan')}
        </Button>
      </section>
    );
  }

  const { plan, status } = subscription;
  const isCanceled = status === 'canceled';

  return (
    <section className="bg-surface-raised border border-border rounded-2xl p-5 flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide text-muted">{t('currentPlan')}</span>
          <span className="text-lg font-semibold text-text">{plan.name}</span>
          {isCanceled && (
            <span className="text-xs text-amber-500">{t('statusCanceled')}</span>
          )}
        </div>
        <span className="text-base text-muted">{formatPrice(plan.priceCents, plan.currency)}</span>
      </header>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button type="button" size="sm" variant="green" onClick={onCancelClick} disabled={isCanceled}>
          {t('cancelPlan')}
        </Button>
        <Button type="button" size="sm" variant="blue" onClick={onChangeClick}>
          {t('changePlan')}
        </Button>
      </div>
    </section>
  );
}
