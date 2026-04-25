'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { Button } from '@/components/ui';
import { formatPrice } from '../helpers';
import type { MySubscriptionSummary } from '../interfaces';

interface SubscriptionBannerProps {
  subscription: MySubscriptionSummary;
}

export function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
  const t = useTranslations('home');
  const router = useRouter();

  return (
    <div className="flex items-center justify-between bg-surface-raised border border-border rounded-2xl px-5 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs uppercase tracking-wide text-muted">{t('currentPlan')}</span>
        <span className="text-sm font-semibold text-text">{subscription.plan.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">
          {formatPrice(subscription.plan.priceCents, subscription.plan.currency)}
        </span>
        <Button type="button" size="sm" variant="blue" onClick={() => router.push('/settings?tab=billing')}>
          {t('changePlan')}
        </Button>
      </div>
    </div>
  );
}
