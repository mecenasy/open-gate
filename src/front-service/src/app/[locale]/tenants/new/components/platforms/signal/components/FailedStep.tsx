'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';

interface FailedStepProps {
  errorCode: string;
  errorMessage: string;
  onRetry: () => void;
  onCancel: () => void;
}

export function FailedStep({ errorCode, errorMessage, onRetry, onCancel }: FailedStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3">
        <p className="text-sm font-semibold text-rose-300">{t('failed_title')}</p>
        <p className="text-xs text-rose-200 mt-1">
          {t(`error_${errorCode}` as Parameters<typeof t>[0], { fallback: errorMessage })}
        </p>
      </div>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="green" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button type="button" variant="blue" onClick={onRetry}>
          {t('failed_retry')}
        </Button>
      </div>
    </div>
  );
}
