'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useSwitchTenant } from '../hooks/use-switch-tenant';

interface TenantCardProps {
  tenantId: string;
  slug: string;
  badgeLabel: string;
  onOpened?: () => void;
}

export function TenantCard({ tenantId, slug, badgeLabel, onOpened }: TenantCardProps) {
  const t = useTranslations('home');
  const { switchTenant, isSwitching } = useSwitchTenant();

  const open = async () => {
    await switchTenant(tenantId);
    onOpened?.();
  };

  return (
    <div className="flex items-center justify-between bg-surface-raised border border-border rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text">{slug}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
          {badgeLabel}
        </span>
      </div>
      <Button type="button" size="sm" variant="blue" disabled={isSwitching} onClick={open}>
        {isSwitching ? t('tenantOpening') : t('tenantOpen')}
      </Button>
    </div>
  );
}
