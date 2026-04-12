'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTransition, animated } from '@react-spring/web';
import { useRouter } from '@/components/navigation/navigation';
import { useTranslations } from 'next-intl';
import { Modal, Input, Button } from '@/components/ui';
import { AuthStatus } from '@/app/gql/graphql';
import { useLogin } from '@/hooks/use-login';
import { useVerify } from '@/hooks/use-verify';
import { useWebAuthnLogin } from '@/hooks/use-webauthn-login';
import { useQrCodeLogin } from '@/hooks/use-qr-code-login';
import passkeyIcon from '@/assets/webauthn.svg';

/* time to let one modal finish its close animation before opening the next */
const MODAL_SWITCH_DELAY = 320;

/* ─── QrLoginStep ────────────────────────────────────────────────────── */

function QrLoginStep({ onCancel }: { onCancel: () => void }) {
  const t = useTranslations('login');
  const tQr = useTranslations('qrCode');
  const { dataUrl, isLoading } = useQrCodeLogin(onCancel);

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm text-muted text-center leading-relaxed">
        {tQr('description')}
      </p>

      <div className="p-4 bg-white rounded-xl border border-border shadow-lg">
        {isLoading || !dataUrl ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <Image
            src={dataUrl}
            alt="QR Code"
            width={200}
            height={200}
            unoptimized
          />
        )}
      </div>

      <p className="text-xs text-muted text-center">{tQr('waiting')}</p>

      <div className="flex justify-end w-full pt-2">
        <Button type="button" variant="red" size="sm" onClick={onCancel}>
          {t('qrBack')}
        </Button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

type Step = 'login' | 'verify';

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyType, setVerifyType] = useState<AuthStatus | undefined>(undefined);
  const [login, setLogin] = useState('');
  const [loginOpen, setLoginOpen] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(true);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { errors: loginErrors, loading, register: loginRegister, onSubmit: loginSubmit } =
    useLogin(setVerifyType, setServerError, setLogin);

  const { errors: verifyErrors, isPending, register: verifyRegister, onSubmit: verifySubmit } =
    useVerify(login, verifyType);

  const { handleToggleChange: passkeyLogin } = useWebAuthnLogin();
  const [passkeyPending, setPasskeyPending] = useState(false);

  const handlePasskeyLogin = async () => {
    setPasskeyPending(true);
    try {
      await passkeyLogin();
    } finally {
      setPasskeyPending(false);
    }
  };

  const clearSwitchTimer = () => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
  };

  const switchToQr = () => {
    clearSwitchTimer();
    setLoginOpen(false);
    switchTimer.current = setTimeout(() => {
      setQrOpen(true);
      switchTimer.current = null;
    }, MODAL_SWITCH_DELAY);
  };

  const switchToLogin = useCallback(() => {
    clearSwitchTimer();
    setQrOpen(false);
    switchTimer.current = setTimeout(() => {
      setLoginOpen(true);
      switchTimer.current = null;
    }, MODAL_SWITCH_DELAY);
  }, []);

  useEffect(() => () => clearSwitchTimer(), []);

  const step: Step = verifyType ? 'verify' : 'login';

  const transitions = useTransition(step, {
    keys: (s) => s,
    from: { x: 40, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    leave: { x: -40, opacity: 0 },
    config: { tension: 320, friction: 28 },
  });

  const handleClose = () => {
    clearSwitchTimer();
    setVerifyType(undefined);
    setLoginOpen(false);
    setQrOpen(false);
    setBackdropOpen(false);
    router.push('/');
  };

  const handleBackdropClick = () => {
    if (qrOpen) switchToLogin();
    else handleClose();
  };

  useEffect(() => {
    document.body.style.overflow = backdropOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [backdropOpen]);

  const backdropTransition = useTransition(backdropOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 280, friction: 30 },
  });

  const loginTitle = verifyType ? t('verifyTitle') : t('title');

  return (
    <>
      {backdropTransition((style, show) =>
        show ? (
          <animated.div
            style={{ ...style, backgroundColor: 'rgba(0,0,0,0.45)' }}
            className="fixed inset-0 z-40"
            onClick={handleBackdropClick}
          />
        ) : null,
      )}

      <Modal
        isOpen={loginOpen}
        onClose={handleClose}
        title={loginTitle}
        showBackdrop={false}
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

                  <div className="flex items-center gap-3 pt-2">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs uppercase tracking-wider text-muted">
                      {t('or')}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <div className="[&>button]:w-full">
                    <Button
                      type="button"
                      variant="green"
                      size="sm"
                      onClick={handlePasskeyLogin}
                      disabled={passkeyPending || loading}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Image
                          src={passkeyIcon}
                          alt=""
                          width={16}
                          height={16}
                          className="invert"
                          unoptimized
                        />
                        {passkeyPending ? t('submitting') : t('passkeyLogin')}
                      </span>
                    </Button>
                  </div>

                  <div className="[&>button]:w-full">
                    <Button
                      type="button"
                      variant="blue"
                      size="sm"
                      onClick={switchToQr}
                      disabled={passkeyPending || loading}
                    >
                      {t('qrLogin')}
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

      <Modal
        isOpen={qrOpen}
        onClose={switchToLogin}
        title={t('qrTitle')}
        showBackdrop={false}
      >
        <QrLoginStep onCancel={switchToLogin} />
      </Modal>
    </>
  );
}
