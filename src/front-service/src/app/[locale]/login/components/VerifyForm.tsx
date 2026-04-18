'use client';

import { useTranslations } from 'next-intl';
import { Input, Button } from '@/components/ui';
import { AuthStatus } from '@/app/gql/graphql';
import { useVerify } from '../hooks/use-verify';

interface VerifyFormProps {
  email: string;
  verifyType: AuthStatus;
  onBack: () => void;
}

export function VerifyForm({ email, verifyType, onBack }: VerifyFormProps) {
  const t = useTranslations('login');
  const { register, errors, onSubmit, isPending, serverError } = useVerify(email, verifyType);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        id="code"
        label={t('verifyCode')}
        type="text"
        inputMode="numeric"
        placeholder={t('verifyCodePlaceholder')}
        error={errors.code?.message}
        {...register('code')}
      />

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="red" size="sm" onClick={onBack}>
          {t('verifyBack')}
        </Button>
        <Button type="submit" variant="blue" size="sm" disabled={isPending}>
          {isPending ? t('verifySubmitting') : t('verifySubmit')}
        </Button>
      </div>
    </form>
  );
}
