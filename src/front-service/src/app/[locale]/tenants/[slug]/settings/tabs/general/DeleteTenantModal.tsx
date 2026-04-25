'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal } from '@/components/ui';

interface DeleteTenantModalProps {
  isOpen: boolean;
  slug: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteTenantModal({
  isOpen,
  slug,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteTenantModalProps) {
  const t = useTranslations('tenantSettings.general');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!isOpen) setTyped('');
  }, [isOpen]);

  const canConfirm = typed === slug && !isDeleting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('deleteTitle')}
      footer={
        <div className="flex justify-between gap-4">
          <Button type="button" variant="green" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="button" variant="blue" disabled={!canConfirm} onClick={() => void onConfirm()}>
            {isDeleting ? t('deleting') : t('confirmDelete')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text">{t('deleteWarning')}</p>
        <p className="text-xs text-muted">{t('deleteTypeToConfirm', { slug })}</p>
        <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={slug} autoFocus />
      </div>
    </Modal>
  );
}
