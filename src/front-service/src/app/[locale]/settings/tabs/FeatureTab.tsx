'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Toggle } from '@/components/ui';
import { useCoreConfigs } from '@/hooks/use-core-configs';
import configIcon from '@/assets/config.svg';

interface ConfigCardProps {
  configKey: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

function ConfigCard({ configKey, description, checked, disabled, onChange }: ConfigCardProps) {
  return (
    <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-border rounded-2xl">
      <div className="flex items-start gap-4">
        <Image src={configIcon} alt="" width={22} height={22} className="nav-icon mt-0.5 shrink-0" unoptimized />
        <div>
          <p className="text-sm font-semibold text-text">{configKey}</p>
          <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function FeatureTab() {
  const t = useTranslations('coreConfig');
  const { configs, isLoading, toggleConfig, pendingKeys } = useCoreConfigs();

  return (
    <div className="max-w-2xl mx-auto relative">
      {configs.length === 0 && !isLoading ? (
        <div className="p-5 bg-surface border border-border rounded-2xl text-center text-sm text-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {configs.map((cfg) => (
            <ConfigCard
              key={cfg.key}
              configKey={cfg.key}
              description={cfg.description}
              checked={cfg.value === 'true'}
              disabled={pendingKeys.has(cfg.key)}
              onChange={() => toggleConfig(cfg.key, cfg.value)}
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
