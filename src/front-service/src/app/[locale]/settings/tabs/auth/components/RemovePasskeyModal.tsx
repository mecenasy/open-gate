'use client';

import { useTranslations } from 'next-intl';
import { Button, Modal } from '@/components/ui';

interface RemovePasskeyModalProps {
  deviceName: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemovePasskeyModal({ deviceName, onClose, onConfirm }: RemovePasskeyModalProps) {
  const t = useTranslations('settings');

  return (
    <Modal
      isOpen={deviceName !== null}
      onClose={onClose}
      title={t('removeKeyTitle')}
      footer={
        <>
          <Button variant="blue" size="sm" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="red" size="sm" onClick={onConfirm}>{t('remove')}</Button>
        </>
      }
    >
      <p className="text-sm text-muted leading-relaxed">
        {t('removeKeyConfirm', { name: deviceName ?? '' })}
      </p>
    </Modal>
  );
}
