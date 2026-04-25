'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

interface AddStaffModalProps {
  isOpen: boolean;
  isAdding: boolean;
  roleOptions: SelectOption<string>[];
  onClose: () => void;
  onConfirm: (userId: string, role: string) => Promise<void> | void;
}

export function AddStaffModal({ isOpen, isAdding, roleOptions, onClose, onConfirm }: AddStaffModalProps) {
  const t = useTranslations('tenantSettings.staff');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<string>(roleOptions[0]?.value ?? 'support');

  useEffect(() => {
    if (!isOpen) {
      setUserId('');
      setRole(roleOptions[0]?.value ?? 'support');
    }
  }, [isOpen, roleOptions]);

  const canConfirm = userId.trim().length > 0 && !isAdding;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addStaffTitle')}
      footer={
        <div className="flex justify-between gap-4">
          <Button type="button" variant="green" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="blue"
            disabled={!canConfirm}
            onClick={() => void onConfirm(userId.trim(), role)}
          >
            {isAdding ? t('adding') : t('confirmAdd')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          label={t('userId')}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder={t('userIdPlaceholder')}
          autoFocus
        />
        <div>
          <span className="text-sm font-medium text-muted">{t('role')}</span>
          <Select<string> value={role} options={roleOptions} onChange={setRole} />
        </div>
      </div>
    </Modal>
  );
}
