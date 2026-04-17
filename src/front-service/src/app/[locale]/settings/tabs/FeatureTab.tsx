'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Toggle } from '@/components/ui';
import { useTenantFeatures } from '@/hooks/use-tenant-features';
import type { TenantFeatureKey } from '@/hooks/use-tenant-features';
import configIcon from '@/assets/config.svg';

interface FeatureCardProps {
  featureKey: TenantFeatureKey;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

function FeatureCard({ title, description, checked, disabled, onChange }: FeatureCardProps) {
  return (
    <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-border rounded-2xl">
      <div className="flex items-start gap-4">
        <Image src={configIcon} alt="" width={22} height={22} className="nav-icon mt-0.5 shrink-0" unoptimized />
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

const FEATURE_KEYS: TenantFeatureKey[] = [
  'enableSignal',
  'enableWhatsApp',
  'enableMessenger',
  'enableGate',
  'enablePayment',
  'enableCommandScheduling',
  'enableAnalytics',
  'enableAudioRecognition',
];

export function FeatureTab() {
  const t = useTranslations('tenantFeatures');
  const { features, isLoading, toggleFeature, pendingKeys } = useTenantFeatures();

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
              featureKey={key}
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
