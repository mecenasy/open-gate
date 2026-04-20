'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';
import { createSlugSchema, type SlugFormValues } from '../schemas/slug.schema';
import { useTenantSlugAvailable } from '../hooks/use-tenant-slug-available';

interface StepBasicsProps {
  defaultSlug: string;
  defaultName: string;
  onCancel: () => void;
  onNext: (values: SlugFormValues) => void;
}

export function StepBasics({ defaultSlug, defaultName, onCancel, onNext }: StepBasicsProps) {
  const t = useTranslations('tenantWizard');
  const tValidation = useTranslations('validation');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SlugFormValues>({
    resolver: zodResolver(createSlugSchema(tValidation)),
    defaultValues: { slug: defaultSlug, name: defaultName },
    mode: 'onChange',
  });

  const slug = watch('slug') ?? '';
  const { isChecking, isAvailable } = useTenantSlugAvailable(slug);

  useEffect(() => {
    /* keep effect to satisfy RHF Strict mode revalidation if needed */
  }, [slug]);

  const onSubmit = handleSubmit((values) => {
    if (isAvailable === false) return;
    onNext(values);
  });

  const slugHint =
    isChecking
      ? t('slugChecking')
      : isAvailable === true
        ? t('slugAvailable')
        : isAvailable === false
          ? t('slugTaken')
          : t('slugHint');

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text">{t('stepBasicsTitle')}</h2>
      <p className="text-sm text-muted">{t('stepBasicsDesc')}</p>

      <Input
        id="slug"
        label={t('fieldSlug')}
        placeholder={t('fieldSlugPlaceholder')}
        error={errors.slug?.message ?? (isAvailable === false ? t('slugTaken') : undefined)}
        hint={slugHint}
        {...register('slug')}
      />

      <Input
        id="name"
        label={t('fieldName')}
        placeholder={t('fieldNamePlaceholder')}
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" variant="blue" disabled={isChecking || isAvailable === false}>
          {t('next')}
        </Button>
      </div>
    </form>
  );
}
