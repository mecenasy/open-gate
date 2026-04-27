'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';

interface QrCodeStepProps {
  qrPngBase64: string;
  instructionKeys: string[];
  onContinue: () => void;
  onCancel: () => void;
}

export function QrCodeStep({ qrPngBase64, instructionKeys, onContinue, onCancel }: QrCodeStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');

  return (
    <div className="flex flex-col gap-4">
      <div className="self-center bg-white p-3 rounded-xl">
        <img
          src={`data:image/png;base64,${qrPngBase64}`}
          alt="Signal device-link QR code"
          width={220}
          height={220}
        />
      </div>
      <ol className="list-decimal list-inside text-sm text-text space-y-1">
        {instructionKeys.map((key) => (
          <li key={key}>{t(`qr_step_${key}` as Parameters<typeof t>[0])}</li>
        ))}
      </ol>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="green" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button type="button" variant="blue" onClick={onContinue}>
          {t('qr_done')}
        </Button>
      </div>
    </div>
  );
}
