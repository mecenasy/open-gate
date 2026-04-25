'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBillingData } from './hooks/use-billing-data';
import { useChangePlan } from './hooks/use-change-plan';
import { useCancelSubscription } from './hooks/use-cancel-subscription';
import { usePreviewPlanChange } from './hooks/use-preview-plan-change';
import { CurrentPlanCard } from './components/CurrentPlanCard';
import { UsageMeters } from './components/UsageMeters';
import { ChangePlanModal } from './components/ChangePlanModal';
import { CancelSubscriptionModal } from './components/CancelSubscriptionModal';
import { SubscriptionHistoryTable } from './components/SubscriptionHistoryTable';

export function BillingTab() {
  const t = useTranslations('billing');
  const { subscription, plans, usage, history, isLoading, error } = useBillingData();
  const { preview, result, isLoading: isPreviewLoading } = usePreviewPlanChange();
  const { changePlan, isSaving } = useChangePlan();
  const { cancelSubscription, isCanceling } = useCancelSubscription();

  const [changeOpen, setChangeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlanId && changeOpen) {
      void preview(selectedPlanId);
    }
  }, [selectedPlanId, changeOpen, preview]);

  const handleOpenChange = () => {
    setSelectedPlanId(null);
    setChangeOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedPlanId) return;
    try {
      await changePlan(selectedPlanId);
      setChangeOpen(false);
      setSelectedPlanId(null);
    } catch {
      // Error stays visible via Apollo error link / toast pipeline; modal remains open.
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelSubscription();
      setCancelOpen(false);
    } catch {
      // ditto
    }
  };

  if (isLoading && !subscription) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{t('loadError')}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <CurrentPlanCard
        subscription={subscription}
        onChangeClick={handleOpenChange}
        onCancelClick={() => setCancelOpen(true)}
      />

      <UsageMeters usage={usage} plan={subscription?.plan ?? null} />

      <SubscriptionHistoryTable history={history} plans={plans} />

      <ChangePlanModal
        isOpen={changeOpen}
        onClose={() => setChangeOpen(false)}
        plans={plans}
        subscription={subscription}
        preview={result}
        isPreviewLoading={isPreviewLoading}
        isSaving={isSaving}
        onPlanSelect={setSelectedPlanId}
        onConfirm={handleConfirmChange}
        selectedPlanId={selectedPlanId}
      />

      <CancelSubscriptionModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        isCanceling={isCanceling}
      />
    </div>
  );
}
