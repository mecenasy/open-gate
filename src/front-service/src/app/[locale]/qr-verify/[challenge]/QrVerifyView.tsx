'use client';

import { useTranslations } from 'next-intl';
import { useQrVerify } from './hooks/use-qr-verify';

interface QrVerifyViewProps {
  challenge: string;
  nonce: string;
}

export function QrVerifyView({ challenge, nonce }: QrVerifyViewProps) {
  const t = useTranslations('qrCodeLogin');
  useQrVerify(challenge, nonce);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800 font-sans">
      <main className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-lg mt-24 mb-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">{t('title')}</h1>
        <p className="text-white text-center mt-10">{t('description')}</p>
      </main>
    </div>
  );
}
