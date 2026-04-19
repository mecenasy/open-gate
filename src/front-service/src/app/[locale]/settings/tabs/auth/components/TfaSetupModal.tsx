'use client';

import { useTranslations } from 'next-intl';
import { Button, Input, Modal } from '@/components/ui';
import { use2faVerify } from '../hooks/use-2fa-verify';

interface TfaSetupModalProps {
  qrCode: string;
  onClose: () => void;
  onVerified: () => void;
}

export function TfaSetupModal({ qrCode, onClose, onVerified }: TfaSetupModalProps) {
  const t = useTranslations('settings');
  const { register, errors, onSubmit, serverError, isPending } = use2faVerify(onVerified);

  return (
    <Modal isOpen={!!qrCode} onClose={onClose} title={t('qrModalTitle')}>
      <div className="flex flex-col items-center gap-6">
        <img src={qrCode} alt="QR code" className="w-48 h-48 rounded-xl border border-border" />
        <p className="text-sm text-muted text-center leading-relaxed">{t('qrInstruction')}</p>
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <Input
            id="tfa-code"
            label={t('verifyCode')}
            type="text"
            inputMode="numeric"
            placeholder={t('verifyCodePlaceholder')}
            error={errors.code?.message}
            {...register('code')}
          />
          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="green" size="sm" onClick={onClose} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="blue" size="sm" disabled={isPending}>
              {isPending ? t('confirming') : t('confirm')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
