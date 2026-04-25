'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { FONT_SIZES } from '../../constants';
import { createBrandingSchema, type BrandingFormValues } from '../../schemas/branding.schema';
import { useUpdateBranding } from '../../hooks/use-update-branding';
import type { TenantBrandingForm } from '../../interfaces';

interface BrandingTabProps {
  tenantId: string;
  branding: TenantBrandingForm;
}

export function BrandingTab({ tenantId, branding }: BrandingTabProps) {
  const t = useTranslations('tenantSettings.branding');
  const tCommon = useTranslations('tenantSettings.common');
  const { save, isSaving } = useUpdateBranding(tenantId);

  const schema = createBrandingSchema(tCommon);
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: branding,
  });

  useEffect(() => {
    form.reset(branding);
  }, [branding, form]);

  const fontOptions: SelectOption<BrandingFormValues['fontSize']>[] = [
    { value: '', label: t('fontDefault') },
    ...FONT_SIZES.map((s) => ({ value: s, label: t(`font_${s}`) })),
  ];

  const submit = form.handleSubmit(async (values) => {
    await save({
      logoUrl: values.logoUrl,
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor,
      fontSize: values.fontSize,
    });
  });

  const fontSize = form.watch('fontSize');

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-xl">
      <Input
        label={t('logoUrl')}
        placeholder="https://"
        error={form.formState.errors.logoUrl?.message}
        {...form.register('logoUrl')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('primaryColor')}
          placeholder="#0066ff"
          error={form.formState.errors.primaryColor?.message}
          {...form.register('primaryColor')}
        />
        <Input
          label={t('secondaryColor')}
          placeholder="#ff8800"
          error={form.formState.errors.secondaryColor?.message}
          {...form.register('secondaryColor')}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-muted">{t('fontSize')}</span>
        <Select<BrandingFormValues['fontSize']>
          value={fontSize}
          options={fontOptions}
          onChange={(v) => form.setValue('fontSize', v, { shouldDirty: true })}
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
