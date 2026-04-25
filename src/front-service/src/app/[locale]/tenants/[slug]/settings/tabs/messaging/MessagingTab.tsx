'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, MultiSelect, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { MESSAGING_CHANNELS, SMS_PROVIDERS } from '../../constants';
import { createMessagingSchema, type MessagingFormValues } from '../../schemas/messaging.schema';
import { useUpdateMessaging } from '../../hooks/use-update-messaging';
import type { TenantMessagingForm } from '../../interfaces';

interface MessagingTabProps {
  tenantId: string;
  messaging: TenantMessagingForm;
}

export function MessagingTab({ tenantId, messaging }: MessagingTabProps) {
  const t = useTranslations('tenantSettings.messaging');
  const tCommon = useTranslations('tenantSettings.common');
  const { save, isSaving } = useUpdateMessaging(tenantId);

  const schema = createMessagingSchema(tCommon);
  const form = useForm<MessagingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      defaultSmsProvider: messaging.defaultSmsProvider,
      priorityChannels: messaging.priorityChannels as MessagingFormValues['priorityChannels'],
      rateLimitPerMinute: messaging.rateLimitPerMinute,
    },
  });

  useEffect(() => {
    form.reset({
      defaultSmsProvider: messaging.defaultSmsProvider,
      priorityChannels: messaging.priorityChannels as MessagingFormValues['priorityChannels'],
      rateLimitPerMinute: messaging.rateLimitPerMinute,
    });
  }, [messaging, form]);

  const providerOptions: SelectOption<MessagingFormValues['defaultSmsProvider']>[] = SMS_PROVIDERS.map((p) => ({
    value: p,
    label: t(`provider_${p}`),
  }));

  const channelOptions = MESSAGING_CHANNELS.map((c) => ({
    value: c as string,
    label: t(`channel_${c}`),
  }));

  const channels = form.watch('priorityChannels');
  const provider = form.watch('defaultSmsProvider');

  const submit = form.handleSubmit(async (values) => {
    await save({
      defaultSmsProvider: values.defaultSmsProvider,
      priorityChannels: values.priorityChannels,
      rateLimitPerMinute: values.rateLimitPerMinute,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <span className="text-sm font-medium text-muted">{t('provider')}</span>
        <Select<MessagingFormValues['defaultSmsProvider']>
          value={provider}
          options={providerOptions}
          onChange={(v) => form.setValue('defaultSmsProvider', v, { shouldDirty: true })}
        />
      </div>

      <div>
        <span className="text-sm font-medium text-muted">{t('channels')}</span>
        <MultiSelect
          options={channelOptions}
          value={channels}
          onChange={(values) =>
            form.setValue('priorityChannels', values as MessagingFormValues['priorityChannels'], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        {form.formState.errors.priorityChannels?.message && (
          <p className="text-xs text-red-400 mt-1">{form.formState.errors.priorityChannels.message}</p>
        )}
      </div>

      <Input
        type="number"
        label={t('rateLimit')}
        error={form.formState.errors.rateLimitPerMinute?.message}
        {...form.register('rateLimitPerMinute', { valueAsNumber: true })}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="blue" disabled={isSaving || !form.formState.isDirty}>
          {isSaving ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
