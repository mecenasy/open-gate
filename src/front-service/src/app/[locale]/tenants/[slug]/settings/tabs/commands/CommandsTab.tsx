'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Toggle } from '@/components/ui';
import { createCommandsSchema, type CommandsFormValues } from '../../schemas/commands.schema';
import { useUpdateCommands } from '../../hooks/use-update-commands';
import type { TenantCommandsForm } from '../../interfaces';

interface CommandsTabProps {
  tenantId: string;
  commands: TenantCommandsForm;
}

export function CommandsTab({ tenantId, commands }: CommandsTabProps) {
  const t = useTranslations('tenantSettings.commands');
  const tCommon = useTranslations('tenantSettings.common');
  const { save, isSaving } = useUpdateCommands(tenantId);

  const schema = createCommandsSchema(tCommon);
  const form = useForm<CommandsFormValues>({ resolver: zodResolver(schema), defaultValues: commands });

  useEffect(() => {
    form.reset(commands);
  }, [commands, form]);

  const promptLib = form.watch('customPromptLibraryEnabled');

  const submit = form.handleSubmit(async (values) => {
    await save(values);
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label={t('timeout')}
          hint={t('timeoutHint')}
          error={form.formState.errors.timeout?.message}
          {...form.register('timeout', { valueAsNumber: true })}
        />
        <Input
          type="number"
          label={t('maxRetries')}
          error={form.formState.errors.maxRetries?.message}
          {...form.register('maxRetries', { valueAsNumber: true })}
        />
        <Input
          type="number"
          label={t('processingDelay')}
          hint={t('delayHint')}
          error={form.formState.errors.processingDelay?.message}
          {...form.register('processingDelay', { valueAsNumber: true })}
        />
      </div>

      <div className="flex items-center justify-between bg-surface-raised border border-border rounded-xl px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-text">{t('promptLibrary')}</span>
          <span className="text-xs text-muted">{t('promptLibraryHint')}</span>
        </div>
        <Toggle
          checked={promptLib}
          onChange={(value) => form.setValue('customPromptLibraryEnabled', value, { shouldDirty: true })}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="blue" disabled={isSaving || !form.formState.isDirty}>
          {isSaving ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
