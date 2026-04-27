'use client';

import { useTranslations } from 'next-intl';
import { useTenantPlatforms } from './use-tenant-platforms';
import { SignalPlatformTile } from './SignalPlatformTile';

interface PlatformsTabProps {
  tenantId: string;
}

export function PlatformsTab({ tenantId }: PlatformsTabProps) {
  const t = useTranslations('tenantSettings.platforms');
  const { platforms, loading, refetch } = useTenantPlatforms();

  const signal = platforms.find((p) => p.platform === 'signal');

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <p className="text-sm text-muted">{t('intro')}</p>

      {loading && !signal && (
        <div className="bg-surface-raised border border-border rounded-xl p-4 text-sm text-muted">
          {t('loading')}
        </div>
      )}

      {signal && (
        <SignalPlatformTile
          tenantId={tenantId}
          configJson={signal.configJson}
          isDefault={signal.isDefault}
          onChanged={() => {
            void refetch();
          }}
        />
      )}
    </div>
  );
}
