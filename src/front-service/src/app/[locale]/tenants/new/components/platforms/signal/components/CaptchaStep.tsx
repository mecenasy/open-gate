'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { openSignalCaptchaPopup } from '../hooks/use-captcha-listener';

interface CaptchaStepProps {
  onCancel: () => void;
}

export function CaptchaStep({ onCancel }: CaptchaStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');
  const [popupOpened, setPopupOpened] = useState(false);

  const open = () => {
    const w = openSignalCaptchaPopup();
    setPopupOpened(Boolean(w));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-raised border border-border rounded-xl p-3">
        <p className="text-sm font-semibold text-text">{t('captcha_title')}</p>
        <p className="text-xs text-muted mt-1">{t('captcha_body')}</p>
      </div>

      <Button type="button" variant="blue" onClick={open}>
        {popupOpened ? t('captcha_reopen') : t('captcha_open')}
      </Button>

      <p className="text-xs text-muted text-center">{t('captcha_waiting')}</p>

      <div className="flex justify-start pt-2">
        <Button type="button" variant="green" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
      </div>
    </div>
  );
}
