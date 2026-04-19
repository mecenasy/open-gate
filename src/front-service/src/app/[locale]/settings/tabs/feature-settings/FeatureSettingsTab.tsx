'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePlatformCredentialsList } from './hooks/use-platform-credentials-list';
import { PlatformTile } from './components/PlatformTile';
import { PlatformConfigModal } from './components/PlatformConfigModal';
import type { SelectedPlatform } from './interfaces';

export function FeatureSettingsTab() {
  const t = useTranslations('fetcherSettings');
  const { platforms, isLoading } = usePlatformCredentialsList();
  const [selected, setSelected] = useState<SelectedPlatform | null>(null);

  if (isLoading && platforms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {platforms.length === 0 ? (
        <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {platforms.map((p) => (
            <PlatformTile
              key={p.platform}
              isDefault={p.isDefault}
              label={t(`platforms.${p.platform}` as Parameters<typeof t>[0])}
              defaultBadge={t('defaultBadge')}
              onClick={() => setSelected({ platform: p.platform, configJson: p.configJson })}
            />
          ))}
        </div>
      )}
      <PlatformConfigModal
        key={selected?.platform ?? 'closed'}
        selected={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
