'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';

interface VerifyCodeStepProps {
  recipient: string;
  channel: 'sms' | 'voice';
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function VerifyCodeStep({ recipient, channel, onSubmit, onCancel }: VerifyCodeStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');
  const [code, setCode] = useState('');
  const trimmed = code.replace(/\D/g, '');
  const valid = trimmed.length === 6;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(trimmed);
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-muted">
        {t(channel === 'voice' ? 'verify_body_voice' : 'verify_body_sms', { recipient })}
      </p>

      <Input
        label={t('verify_field_code')}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
      />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="green" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" variant="blue" disabled={!valid}>
          {t('verify_submit')}
        </Button>
      </div>
    </form>
  );
}
