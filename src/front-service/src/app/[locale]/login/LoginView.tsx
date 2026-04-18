'use client';

import { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui';
import { AuthStatus } from '@/app/gql/graphql';
import { LoginForm } from './components/LoginForm';
import { VerifyForm } from './components/VerifyForm';
import { QrLoginStep } from './components/QrLoginStep';
import { useLoginFlow } from './hooks/use-login-flow';
import type { Step } from './interfaces';

interface VerifyContext {
  email: string;
  type: AuthStatus;
}

export function LoginView() {
  const t = useTranslations('login');
  const flow = useLoginFlow();
  const [verify, setVerify] = useState<VerifyContext | null>(null);

  const step: Step = verify ? 'verify' : 'login';

  const transitions = useTransition(step, {
    keys: (s) => s,
    from: { x: 40, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    leave: { x: -40, opacity: 0 },
    config: { tension: 320, friction: 28 },
  });

  const backdropTransition = useTransition(flow.backdropOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 280, friction: 30 },
  });

  const title = verify ? t('verifyTitle') : t('title');

  return (
    <>
      {backdropTransition((style, show) =>
        show ? (
          <animated.div
            style={{ ...style, backgroundColor: 'rgba(0,0,0,0.45)' }}
            className="fixed inset-0 z-40"
            onClick={flow.handleBackdropClick}
          />
        ) : null,
      )}

      <Modal isOpen={flow.loginOpen} onClose={flow.close} title={title} showBackdrop={false}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {transitions((style, currentStep) =>
            currentStep === 'login' ? (
              <animated.div style={style}>
                <LoginForm
                  onVerifyNeeded={setVerify}
                  onQr={flow.switchToQr}
                  onCancel={flow.close}
                />
              </animated.div>
            ) : verify ? (
              <animated.div style={style}>
                <VerifyForm
                  email={verify.email}
                  verifyType={verify.type}
                  onBack={() => setVerify(null)}
                />
              </animated.div>
            ) : null,
          )}
        </div>
      </Modal>

      <Modal
        isOpen={flow.qrOpen}
        onClose={flow.switchToLogin}
        title={t('qrTitle')}
        showBackdrop={false}
      >
        <QrLoginStep onCancel={flow.switchToLogin} />
      </Modal>
    </>
  );
}
