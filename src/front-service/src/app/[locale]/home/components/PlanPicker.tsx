'use client';

import { useTranslations } from 'next-intl';
import type { MySubscriptionSummary, SubscriptionPlanSummary } from '../interfaces';
import { useSelectPlan } from '../hooks/use-select-plan';
import { PlanCard } from './PlanCard';

interface PlanPickerProps {
  plans: SubscriptionPlanSummary[];
  currentSubscription: MySubscriptionSummary | null;
}

export function PlanPicker({ plans, currentSubscription }: PlanPickerProps) {
  const t = useTranslations('home');
  const { selectPlan, isSelecting } = useSelectPlan();

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h2 className="text-lg font-semibold text-text">
          {currentSubscription ? t('changePlanTitle') : t('choosePlanTitle')}
        </h2>
        <p className="text-sm text-muted mt-1">{t('choosePlanDesc')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={currentSubscription?.plan.id === plan.id}
            isDisabled={isSelecting}
            onSelect={() => selectPlan(plan.id)}
          />
        ))}
      </div>
    </section>
  );
}
