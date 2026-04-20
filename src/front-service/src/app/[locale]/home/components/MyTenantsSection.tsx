'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { Button } from '@/components/ui';
import type { TenantSummary } from '../interfaces';
import { TenantCard } from './TenantCard';

interface MyTenantsSectionProps {
  tenants: TenantSummary[];
  maxTenants: number;
}

export function MyTenantsSection({ tenants, maxTenants }: MyTenantsSectionProps) {
  const t = useTranslations('home');
  const router = useRouter();
  const canCreateMore = tenants.length < maxTenants;

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">
          {t('myTenantsTitle', { current: tenants.length, max: maxTenants })}
        </h2>
        <Button
          type="button"
          size="sm"
          variant={canCreateMore ? 'blue' : 'green'}
          disabled={!canCreateMore}
          onClick={() => router.push('/tenants/new')}
        >
          {canCreateMore ? t('createTenant') : t('tenantLimitReached')}
        </Button>
      </header>

      {tenants.length === 0 ? (
        <p className="text-sm text-muted italic">{t('myTenantsEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tenants.map((tenant) => (
            <li key={tenant.id}>
              <TenantCard tenantId={tenant.id} slug={tenant.slug} badgeLabel={t('badgeOwner')} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
