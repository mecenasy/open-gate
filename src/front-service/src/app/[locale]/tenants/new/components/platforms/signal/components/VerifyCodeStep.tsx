'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';

interface VerifyCodeStepProps {
  recipient: string;
  channel: 'sms' | 'voice';
  /**
   * Auto-detected code from the Twilio webhook (managed flow only).
   * When present we hydrate the input with it; the user can still edit
   * before submitting in case the regex picked up the wrong six digits.
   */
  autoFilledCode?: string | null;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function VerifyCodeStep({ recipient, channel, autoFilledCode, onSubmit, onCancel }: VerifyCodeStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');
  const [code, setCode] = useState('');
  const trimmed = code.replace(/\D/g, '');
  const valid = trimmed.length === 6;

  // First non-null auto-fill wins — once the user starts editing, we
  // don't overwrite their input even if the bridge re-emits the same
  // code or a stale pollInterval lands a second response.
  useEffect(() => {
    if (autoFilledCode && code === '') setCode(autoFilledCode);
  }, [autoFilledCode, code]);

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

      {autoFilledCode && (
        <div className="bg-emerald-500/5 border border-emerald-500/40 rounded-xl p-3">
          <p className="text-xs text-emerald-200">{t('verify_autoFilled_hint')}</p>
        </div>
      )}

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
