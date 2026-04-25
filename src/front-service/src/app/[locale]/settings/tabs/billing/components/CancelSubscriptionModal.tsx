'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal } from '@/components/ui';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCanceling: boolean;
}

const CONFIRM_TOKEN = 'CANCEL';

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  isCanceling,
}: CancelSubscriptionModalProps) {
  const t = useTranslations('billing');
  const [typed, setTyped] = useState('');

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  const canConfirm = typed === CONFIRM_TOKEN && !isCanceling;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('cancelTitle')}
      footer={
        <div className="flex justify-between">
          <Button type="button" variant="green" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button type="button" variant="blue" disabled={!canConfirm} onClick={onConfirm}>
            {isCanceling ? t('saving') : t('cancelConfirm')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text">{t('cancelDesc')}</p>
        <p className="text-xs text-muted">
          {t('cancelTypeToConfirm', { token: CONFIRM_TOKEN })}
        </p>
        <Input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={CONFIRM_TOKEN}
          autoFocus
        />
      </div>
    </Modal>
  );
}
