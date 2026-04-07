'use client';

import { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useRouter } from '@/components/navigation/navigation';
import { useTranslations } from 'next-intl';
import { Modal, Input, Button } from '@/components/ui';
import { AuthStatus } from '@/app/gql/graphql';
import { useLogin } from '@/hooks/use-login';
import { useVerify } from '@/hooks/use-verify';

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyType, setVerifyType] = useState<AuthStatus | undefined>(undefined);
  const [login, setLogin] = useState('');

  const { errors: loginErrors, loading, register: loginRegister, onSubmit: loginSubmit } =
    useLogin(setVerifyType, setServerError, setLogin);

  const { errors: verifyErrors, isPending, register: verifyRegister, onSubmit: verifySubmit } =
    useVerify(login, verifyType);

  const step = verifyType ? 'verify' : 'login';

  const transitions = useTransition(step, {
    keys: (s) => s,
    from: { x: 40, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    leave: { x: -40, opacity: 0 },
    config: { tension: 320, friction: 28 },
  });

  const handleClose = () => {
    setVerifyType(undefined);
    router.push('/');
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={verifyType ? t('verifyTitle') : t('title')}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {transitions((style, s) =>
          s === 'login' ? (
            <animated.div style={style}>
              <form onSubmit={loginSubmit} className="flex flex-col gap-4">
                <Input
                  id="email"
                  label={t('email')}
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  error={loginErrors.email?.message}
                  {...loginRegister('email')}
                />

                <Input
                  id="password"
                  label={t('password')}
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  error={loginErrors.password?.message}
                  {...loginRegister('password')}
                />

                {serverError && <p className="text-sm text-red-400">{serverError}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="red" size="sm" onClick={handleClose}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" variant="blue" size="sm" disabled={loading}>
                    {loading ? t('submitting') : t('submit')}
                  </Button>
                </div>
              </form>
            </animated.div>
          ) : (
            <animated.div style={style}>
              <form onSubmit={verifySubmit} className="flex flex-col gap-4">
                <Input
                  id="code"
                  label={t('verifyCode')}
                  type="text"
                  inputMode="numeric"
                  placeholder={t('verifyCodePlaceholder')}
                  error={verifyErrors.code?.message}
                  {...verifyRegister('code')}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="red"
                    size="sm"
                    onClick={() => setVerifyType(undefined)}
                  >
                    {t('verifyBack')}
                  </Button>
                  <Button type="submit" variant="blue" size="sm" disabled={isPending}>
                    {isPending ? t('verifySubmitting') : t('verifySubmit')}
                  </Button>
                </div>
              </form>
            </animated.div>
          )
        )}
      </div>
    </Modal>
  );
}
