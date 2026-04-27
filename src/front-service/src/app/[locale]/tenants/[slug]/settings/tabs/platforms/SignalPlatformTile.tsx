'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { SignalOnboardingFlow } from '@/app/[locale]/tenants/new/components/platforms/signal/SignalOnboardingFlow';

interface SignalPlatformTileProps {
  tenantId: string;
  configJson: string;
  isDefault: boolean;
  onChanged: () => void;
}

interface SignalConfigShape {
  apiUrl?: string;
  account?: string;
}

function parseConfig(raw: string): SignalConfigShape {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SignalConfigShape;
  } catch {
    return {};
  }
}

function maskAccount(account: string | undefined): string {
  if (!account) return '—';
  // +48501234567 → +48 50* *** *567
  const digits = account.replace(/\D/g, '');
  if (digits.length < 6) return account;
  const head = account.slice(0, 5);
  const tail = account.slice(-3);
  return `${head}*** ***${tail}`;
}

export function SignalPlatformTile({ tenantId, configJson, isDefault, onChanged }: SignalPlatformTileProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantSettings.platforms');

  const config = useMemo(() => parseConfig(configJson), [configJson]);
  const hasAccount = Boolean(config.account);

  const [flow, setFlow] = useState<{ intent: 'initial' | 'replace' } | null>(null);

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-text">{tCommon('platform_signal')}</span>
          <span className="text-xs text-muted">
            {hasAccount ? tCommon('signal_status_active') : tCommon('signal_status_unconfigured')}
          </span>
        </div>
        {isDefault && (
          <span className="text-[10px] uppercase tracking-wide text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
            {tCommon('using_default')}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted">{tCommon('field_account')}</dt>
        <dd className="text-text font-mono">{maskAccount(config.account)}</dd>
        <dt className="text-muted">{tCommon('field_apiUrl')}</dt>
        <dd className="text-text break-all">{config.apiUrl || tCommon('value_default_gateway')}</dd>
      </dl>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="blue"
          onClick={() => setFlow({ intent: hasAccount ? 'replace' : 'initial' })}
        >
          {hasAccount ? t('cta_change_number') : t('cta_setup')}
        </Button>
      </div>

      {flow && (
        <SignalOnboardingFlow
          isOpen={true}
          tenantId={tenantId}
          intent={flow.intent}
          previousAccount={flow.intent === 'replace' ? config.account : undefined}
          defaults={{
            apiUrl: config.apiUrl ?? '',
            account: '',
            mode: 'register',
          }}
          onClose={() => setFlow(null)}
          onDone={() => {
            setFlow(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
