'use client';

import { useState } from 'react';
import { useRouter } from '@/components/navigation/navigation';
import { useTranslations } from 'next-intl';
import { Modal, Input, Button } from '@/components/ui';
import { useRegister } from '@/hooks/use-register';

export default function RegistrationPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, errors, onSubmit, loading } = useRegister(setServerError);
  console.log("🚀 ~ RegistrationPage ~ errors:", errors)

  return (
    <Modal
      isOpen
      onClose={() => router.push('/')}
      title={t('title')}
      footer={
        <Button variant="red" size="sm" onClick={() => router.push('/')}>
          {t('cancel')}
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          id="tenantSlug"
          label={t('tenantSlug')}
          placeholder={t('tenantSlugPlaceholder')}
          hint={t('tenantSlugHint')}
          error={errors.tenantSlug?.message}
          {...register('tenantSlug')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="name"
            label={t('name')}
            placeholder={t('namePlaceholder')}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="surname"
            label={t('surname')}
            placeholder={t('surnamePlaceholder')}
            error={errors.surname?.message}
            {...register('surname')}
          />
        </div>

        <Input
          id="email"
          label={t('email')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="phone"
          label={t('phone')}
          type="tel"
          placeholder={t('phonePlaceholder')}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          id="password"
          label={t('password')}
          type="password"
          placeholder={t('passwordPlaceholder')}
          error={errors.password?.message}
          hint={t('passwordHint')}
          {...register('password')}
        />

        <Input
          id="confirmPassword"
          label={t('confirmPassword')}
          type="password"
          placeholder={t('passwordPlaceholder')}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && <p className="text-sm text-red-400">{serverError}</p>}

        <Button type="submit" variant="green" disabled={loading}>
          {loading ? t('submitting') : t('submit')}
        </Button>
      </form>
    </Modal>
  );
}
