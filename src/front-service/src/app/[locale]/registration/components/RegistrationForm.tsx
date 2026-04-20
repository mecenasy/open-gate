'use client';

import { useTranslations } from 'next-intl';
import { Input, Button } from '@/components/ui';
import { useRegister } from '../hooks/use-register';

export function RegistrationForm() {
  const t = useTranslations('register');
  const { register, errors, onSubmit, loading, serverError, submittedEmail } = useRegister();

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text">{t('checkEmailTitle')}</h2>
        <p className="text-sm text-muted">{t('checkEmailDesc', { email: submittedEmail })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
  );
}
