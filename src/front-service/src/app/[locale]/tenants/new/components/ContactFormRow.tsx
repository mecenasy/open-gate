'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Select } from '@/components/ui';
import { ACCESS_LEVEL_LABEL_KEYS } from '../constants';
import type { ContactDraft } from '../interfaces';
import { createContactSchema, type ContactFormValues } from '../schemas/contact.schema';

interface ContactFormRowProps {
  onAdd: (contact: ContactDraft) => void;
}

const defaultValues: ContactFormValues = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  accessLevel: 'primary',
};

export function ContactFormRow({ onAdd }: ContactFormRowProps) {
  const t = useTranslations('tenantWizard');
  const tValidation = useTranslations('validation');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(createContactSchema(tValidation)),
    defaultValues,
  });

  const accessLevel = watch('accessLevel');

  const onSubmit = handleSubmit((values) => {
    onAdd({
      id: crypto.randomUUID(),
      name: values.name.trim(),
      surname: (values.surname ?? '').trim(),
      email: (values.email ?? '').trim(),
      phone: (values.phone ?? '').trim(),
      accessLevel: values.accessLevel,
    });
    reset(defaultValues);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 bg-surface-raised border border-border rounded-xl p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="contact-name"
          label={t('contactName')}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="contact-surname"
          label={t('contactSurname')}
          error={errors.surname?.message}
          {...register('surname')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="contact-email"
          type="email"
          label={t('contactEmail')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="contact-phone"
          type="tel"
          label={t('contactPhone')}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <Select<'primary' | 'secondary'>
        label={t('contactAccessLevel')}
        value={accessLevel}
        onChange={(v) => setValue('accessLevel', v, { shouldValidate: true })}
        options={[
          { value: 'primary', label: t(ACCESS_LEVEL_LABEL_KEYS.primary as Parameters<typeof t>[0]) },
          { value: 'secondary', label: t(ACCESS_LEVEL_LABEL_KEYS.secondary as Parameters<typeof t>[0]) },
        ]}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="blue" size="sm">
          {t('contactAdd')}
        </Button>
      </div>
    </form>
  );
}
