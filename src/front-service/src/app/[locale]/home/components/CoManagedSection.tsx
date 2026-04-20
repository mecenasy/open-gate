'use client';

import { useTranslations } from 'next-intl';
import type { StaffMembershipSummary } from '../interfaces';
import { TenantCard } from './TenantCard';

interface CoManagedSectionProps {
  memberships: StaffMembershipSummary[];
}

const ROLE_LABEL_KEYS: Record<string, string> = {
  owner: 'badgeOwner',
  admin: 'badgeAdmin',
  support: 'badgeSupport',
};

export function CoManagedSection({ memberships }: CoManagedSectionProps) {
  const t = useTranslations('home');

  if (memberships.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text">{t('coManagedTitle')}</h2>
      <ul className="flex flex-col gap-2">
        {memberships.map((m) => {
          const key = ROLE_LABEL_KEYS[m.role.toLowerCase()] ?? 'badgeSupport';
          return (
            <li key={m.tenantId}>
              <TenantCard
                tenantId={m.tenantId}
                slug={m.tenantSlug}
                badgeLabel={t(key as Parameters<typeof t>[0])}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
