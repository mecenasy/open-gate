'use client';

import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Toggle } from '@/components/ui';
import { createSignalFormSchema, type SignalFormSchema } from '../schemas/signal-form.schema';
import { DEFAULT_SIGNAL_FORM } from '../constants';
import type { SignalIntent } from '../signal-onboarding.machine';

interface SignalFormStepProps {
  intent: SignalIntent;
  defaults?: Partial<SignalFormSchema>;
  onSubmit: (values: SignalFormSchema) => void;
  onCancel: () => void;
}

export function SignalFormStep({ intent, defaults, onSubmit, onCancel }: SignalFormStepProps) {
  const t = useTranslations('signalOnboarding');
  const tCommon = useTranslations('tenantWizard');

  const form = useForm<SignalFormSchema>({
    resolver: zodResolver(createSignalFormSchema(t)) as unknown as Resolver<SignalFormSchema>,
    defaultValues: { ...DEFAULT_SIGNAL_FORM, ...defaults },
  });

  const mode = form.watch('mode');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 min-h-0">
      <div className="flex flex-col gap-1">
        <Input
          type="url"
          label={t('field_apiUrl')}
          placeholder="https://signal.example.com"
          error={form.formState.errors.apiUrl?.message}
          {...form.register('apiUrl')}
        />
        <p className="text-xs text-muted">{t('field_apiUrl_hint')}</p>
      </div>

      <Input
        type="tel"
        label={t('field_account')}
        placeholder="+48..."
        error={form.formState.errors.account?.message}
        {...form.register('account')}
      />

      <div className="flex flex-col gap-2 bg-surface-raised border border-border rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text">
            {mode === 'link' ? t('mode_link_label') : t('mode_register_label')}
          </span>
          <Toggle
            checked={mode === 'link'}
            onChange={(v) => form.setValue('mode', v ? 'link' : 'register')}
          />
        </div>
        <p className="text-xs text-muted">
          {mode === 'link' ? t('mode_link_hint') : t('mode_register_hint')}
        </p>
      </div>

      {mode === 'register' && (
        <div className="bg-amber-500/15 border border-amber-500/60 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700">{t('warning_title')}</p>
          <p className="text-xs text-amber-700 mt-1">
            {intent === 'replace' ? t('warning_replace') : t('warning_initial')}
          </p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="green" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" variant="blue">
          {tCommon('next')}
        </Button>
      </div>
    </form>
  );
}
