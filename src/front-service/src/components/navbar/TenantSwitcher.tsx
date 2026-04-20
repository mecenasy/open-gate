'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { useHomeData } from '@/app/[locale]/home/hooks/use-home-data';
import { useSwitchTenant } from '@/app/[locale]/home/hooks/use-switch-tenant';

interface TenantSwitcherProps {
  activeTenantId: string | null;
}

export function TenantSwitcher({ activeTenantId }: TenantSwitcherProps) {
  const t = useTranslations('home');
  const { myTenants, staffMemberships } = useHomeData();
  const { switchTenant, isSwitching } = useSwitchTenant();

  const options = useMemo<SelectOption<string>[]>(() => {
    const entries = new Map<string, string>();
    for (const tenant of myTenants) {
      entries.set(tenant.id, tenant.slug);
    }
    for (const m of staffMemberships) {
      if (!entries.has(m.tenantId)) entries.set(m.tenantId, m.tenantSlug);
    }
    return Array.from(entries.entries()).map(([value, label]) => ({ value, label }));
  }, [myTenants, staffMemberships]);

  if (options.length === 0) return null;

  const current = activeTenantId && options.some((o) => o.value === activeTenantId) ? activeTenantId : options[0].value;

  return (
    <div className="min-w-[160px]">
      <Select<string>
        value={current}
        options={options}
        disabled={isSwitching}
        onChange={(value) => {
          if (value !== activeTenantId) switchTenant(value);
        }}
      />
    </div>
  );
}
