'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Toggle } from '@/components/ui';
import { useRouter } from '@/components/navigation/navigation';
import { useSetTenantActive } from '../../hooks/use-set-tenant-active';
import { useDeleteTenant } from '../../hooks/use-delete-tenant';
import { DeleteTenantModal } from './DeleteTenantModal';

interface GeneralTabProps {
  tenantId: string;
  slug: string;
  isActive: boolean;
  billingUserId: string | null;
}

export function GeneralTab({ tenantId, slug, isActive, billingUserId }: GeneralTabProps) {
  const t = useTranslations('tenantSettings.general');
  const router = useRouter();
  const { setActive, isSaving } = useSetTenantActive();
  const { deleteTenant, isDeleting } = useDeleteTenant();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-surface-raised border border-border rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-text">{t('identity')}</h3>
        <Input label={t('slug')} value={slug} readOnly disabled />
        <Input label={t('billingUser')} value={billingUserId ?? '—'} readOnly disabled />
      </section>

      <section className="bg-surface-raised border border-border rounded-2xl p-5 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-text">{t('activeTitle')}</span>
          <span className="text-xs text-muted">{t('activeDesc')}</span>
        </div>
        <Toggle
          checked={isActive}
          onChange={(value) => void setActive(tenantId, value)}
          disabled={isSaving}
        />
      </section>

      <section className="bg-red-500/5 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-red-300">{t('dangerTitle')}</span>
          <span className="text-xs text-muted">{t('dangerDesc')}</span>
        </div>
        <Button type="button" variant="green" onClick={() => setConfirmDelete(true)}>
          {t('deleteTenant')}
        </Button>
      </section>

      <DeleteTenantModal
        isOpen={confirmDelete}
        slug={slug}
        isDeleting={isDeleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteTenant(tenantId, slug);
          setConfirmDelete(false);
          router.push('/');
        }}
      />
    </div>
  );
}
