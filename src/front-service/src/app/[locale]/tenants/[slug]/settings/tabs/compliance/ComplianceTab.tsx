'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Toggle } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { RESIDENCIES } from '../../constants';
import { createComplianceSchema, type ComplianceFormValues } from '../../schemas/compliance.schema';
import { useUpdateCompliance } from '../../hooks/use-update-compliance';
import type { TenantComplianceForm } from '../../interfaces';

interface ComplianceTabProps {
  tenantId: string;
  compliance: TenantComplianceForm;
}

export function ComplianceTab({ tenantId, compliance }: ComplianceTabProps) {
  const t = useTranslations('tenantSettings.compliance');
  const tCommon = useTranslations('tenantSettings.common');
  const { save, isSaving } = useUpdateCompliance(tenantId);

  const schema = createComplianceSchema(tCommon);
  const form = useForm<ComplianceFormValues>({ resolver: zodResolver(schema), defaultValues: compliance });

  useEffect(() => {
    form.reset(compliance);
  }, [compliance, form]);

  const residency = form.watch('dataResidency');
  const encryption = form.watch('encryptionEnabled');

  const residencyOptions: SelectOption<ComplianceFormValues['dataResidency']>[] = RESIDENCIES.map((r) => ({
    value: r,
    label: t(`residency_${r}`),
  }));

  const submit = form.handleSubmit(async (values) => {
    await save({
      dataResidency: values.dataResidency,
      encryptionEnabled: values.encryptionEnabled,
      webhookUrl: values.webhookUrl,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <span className="text-sm font-medium text-muted">{t('residency')}</span>
        <Select<ComplianceFormValues['dataResidency']>
          value={residency}
          options={residencyOptions}
          onChange={(v) => form.setValue('dataResidency', v, { shouldDirty: true })}
        />
      </div>

      <div className="flex items-center justify-between bg-surface-raised border border-border rounded-xl px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-text">{t('encryption')}</span>
          <span className="text-xs text-muted">{t('encryptionHint')}</span>
        </div>
        <Toggle
          checked={encryption}
          onChange={(value) => form.setValue('encryptionEnabled', value, { shouldDirty: true })}
        />
      </div>

      <Input
        label={t('webhookUrl')}
        placeholder="https://"
        error={form.formState.errors.webhookUrl?.message}
        {...form.register('webhookUrl')}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="blue" disabled={isSaving || !form.formState.isDirty}>
          {isSaving ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
