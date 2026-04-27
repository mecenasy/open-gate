'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';

interface GatewayChoiceStepProps {
  reasonCode: string;
  context: Record<string, unknown>;
  onUseDefault: () => void;
  onCancel: () => void;
}

export function GatewayChoiceStep({ reasonCode, context, onUseDefault, onCancel }: GatewayChoiceStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');
  const apiUrl = typeof context.apiUrl === 'string' ? context.apiUrl : '';
  const defaultApiUrl = typeof context.defaultApiUrl === 'string' ? context.defaultApiUrl : '';

  // For now we only emit one reasonCode; switch on it once we have more.
  void reasonCode;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-500/5 border border-amber-500/40 rounded-xl p-3">
        <p className="text-sm font-semibold text-amber-300">{t('gatewayUnreachable_title')}</p>
        <p className="text-xs text-amber-200 mt-1">{t('gatewayUnreachable_body', { apiUrl })}</p>
        {defaultApiUrl && (
          <p className="text-xs text-muted mt-2">
            {t('gatewayUnreachable_defaultHint', { defaultApiUrl })}
          </p>
        )}
        <p className="text-xs text-muted mt-2">{t('gatewayUnreachable_laterHint')}</p>
      </div>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="green" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button type="button" variant="blue" onClick={onUseDefault}>
          {t('gatewayUnreachable_useDefault')}
        </Button>
      </div>
    </div>
  );
}
