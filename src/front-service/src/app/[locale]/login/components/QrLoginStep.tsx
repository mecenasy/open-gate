'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useQrCodeLogin } from '../hooks/use-qr-code-login';

interface QrLoginStepProps {
  onCancel: () => void;
}

export function QrLoginStep({ onCancel }: QrLoginStepProps) {
  const t = useTranslations('login');
  const tQr = useTranslations('qrCode');
  const { dataUrl, isLoading, serverError } = useQrCodeLogin(onCancel);

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm text-muted text-center leading-relaxed">{tQr('description')}</p>

      <div className="p-4 bg-white rounded-xl border border-border shadow-lg">
        {isLoading || !dataUrl ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <Image src={dataUrl} alt="QR Code" width={200} height={200} unoptimized />
        )}
      </div>

      <p className="text-xs text-muted text-center">{tQr('waiting')}</p>
      {serverError && <p className="text-sm text-red-400 text-center">{serverError}</p>}

      <div className="flex justify-end w-full pt-2">
        <Button type="button" variant="red" size="sm" onClick={onCancel}>
          {t('qrBack')}
        </Button>
      </div>
    </div>
  );
}
