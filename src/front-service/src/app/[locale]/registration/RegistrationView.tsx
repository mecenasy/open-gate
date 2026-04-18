'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { Modal, Button } from '@/components/ui';
import { RegistrationForm } from './components/RegistrationForm';

export function RegistrationView() {
  const t = useTranslations('register');
  const router = useRouter();
  const goHome = () => router.push('/');

  return (
    <Modal
      isOpen
      onClose={goHome}
      title={t('title')}
      footer={
        <Button variant="red" size="sm" onClick={goHome}>
          {t('cancel')}
        </Button>
      }
    >
      <RegistrationForm />
    </Modal>
  );
}
