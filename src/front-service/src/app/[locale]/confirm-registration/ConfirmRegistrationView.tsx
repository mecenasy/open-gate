'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/components/navigation/navigation';
import { Button } from '@/components/ui';
import { useConfirmRegistration } from './hooks/use-confirm-registration';

export function ConfirmRegistrationView() {
  const t = useTranslations('confirmRegistration');
  const params = useSearchParams();
  const token = params.get('token');
  const { state } = useConfirmRegistration(token);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {state === 'verifying' && (
        <>
          <h1 className="text-xl font-bold text-text mb-4">{t('verifyingTitle')}</h1>
          <p className="text-sm text-muted">{t('verifyingDesc')}</p>
        </>
      )}
      {state === 'success' && (
        <>
          <h1 className="text-xl font-bold text-text mb-4">{t('successTitle')}</h1>
          <p className="text-sm text-muted mb-6">{t('successDesc')}</p>
          <Link href="/login">
            <Button variant="green">{t('goToLogin')}</Button>
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <h1 className="text-xl font-bold text-text mb-4">{t('errorTitle')}</h1>
          <p className="text-sm text-muted mb-6">{t('errorDesc')}</p>
          <Link href="/registration">
            <Button variant="green">{t('tryAgain')}</Button>
          </Link>
        </>
      )}
    </div>
  );
}
