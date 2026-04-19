'use client';

import { useTranslations } from 'next-intl';
import { useTenantFeaturesList } from './hooks/use-tenant-features-list';
import { useTenantFeaturesToggle } from './hooks/use-tenant-features-toggle';
import { FeatureCard } from './components/FeatureCard';
import { FEATURE_KEYS } from './constants';

export function FeatureTab() {
  const t = useTranslations('tenantFeatures');
  const { features, isLoading } = useTenantFeaturesList();
  const { toggleFeature, pendingKeys } = useTenantFeaturesToggle();

  return (
    <div className="max-w-2xl mx-auto relative">
      {!features && !isLoading ? (
        <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {FEATURE_KEYS.map((key) => (
            <FeatureCard
              key={key}
              title={t(`${key}.title` as Parameters<typeof t>[0])}
              description={t(`${key}.description` as Parameters<typeof t>[0])}
              checked={features ? Boolean(features[key]) : false}
              disabled={pendingKeys.has(key)}
              onChange={() => features && toggleFeature(key, Boolean(features[key]))}
            />
          ))}
        </div>
      )}
      {isLoading && (
        <div className="flex absolute inset-0 bg-white/20 pointer-events-none items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
