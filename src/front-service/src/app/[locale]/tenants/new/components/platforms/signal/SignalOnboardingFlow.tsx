'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui';
import type { SignalFormSchema } from './schemas/signal-form.schema';
import { useSignalOnboarding } from './hooks/use-signal-onboarding';
import { useCaptchaListener } from './hooks/use-captcha-listener';
import type { SignalIntent } from './signal-onboarding.machine';
import { BusyStep } from './components/BusyStep';
import { CaptchaStep } from './components/CaptchaStep';
import { FailedStep } from './components/FailedStep';
import { GatewayChoiceStep } from './components/GatewayChoiceStep';
import { QrCodeStep } from './components/QrCodeStep';
import { SignalFormStep } from './components/SignalFormStep';
import { VerifyCodeStep } from './components/VerifyCodeStep';

interface SignalOnboardingFlowProps {
  isOpen: boolean;
  /** Settings flow when set; wizard flow when omitted. */
  tenantId?: string;
  intent: SignalIntent;
  previousAccount?: string;
  /** Prefill values when re-opening (e.g. wizard remembers what was typed). */
  defaults?: Partial<SignalFormSchema>;
  /**
   * When true, the form step renders `account` as read-only and hides
   * the register/link toggle (mode is forced to 'register'). Used by the
   * managed-flow wizard: the user just bought a phone number and
   * shouldn't be able to type a different account or pick the link
   * mode — Signal verification must be a fresh registration on the
   * managed Twilio number.
   */
  lockMode?: boolean;
  onClose: () => void;
  /**
   * Fired when the flow finishes successfully. For wizard flow, the parent
   * stores `credentialsJson` in PlatformDraft. For settings flow, the BFF
   * has already persisted the credentials — `credentialsJson` is informational.
   */
  onDone: (credentialsJson: string) => void;
}

const BUSY_STAGES: ReadonlySet<string> = new Set([
  'starting',
  'submittingCaptcha',
  'submittingCode',
  'submittingChoice',
  'submittingQrConfirm',
]);

export function SignalOnboardingFlow({
  isOpen,
  tenantId,
  intent,
  previousAccount,
  defaults,
  lockMode = false,
  onClose,
  onDone,
}: SignalOnboardingFlowProps) {
  const t = useTranslations('signalOnboarding');

  const { state, send } = useSignalOnboarding({ tenantId, intent, previousAccount });

  // Same-origin postMessage listener — only active on captcha step so a
  // stale popup can't push tokens into other states.
  const onCaptchaToken = useCallback(
    (token: string) => send({ type: 'CAPTCHA_TOKEN_RECEIVED', token }),
    [send],
  );
  useCaptchaListener(state.matches('captcha'), onCaptchaToken);

  useEffect(() => {
    if (state.matches('done') && state.context.credentialsJson) {
      onDone(state.context.credentialsJson);
    }
  }, [state, onDone]);

  useEffect(() => {
    if (state.matches('cancelled')) onClose();
  }, [state, onClose]);

  const stage = state.value as string;
  const step = state.context.step;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => send({ type: 'CANCEL' })}
      title={t(intent === 'replace' ? 'titleReplace' : 'titleInitial')}
      className="max-w-xl"
      footer={null}
    >
      {stage === 'form' && (
        <SignalFormStep
          intent={intent}
          defaults={defaults}
          lockMode={lockMode}
          onSubmit={(values) => send({ type: 'SUBMIT_FORM', values })}
          onCancel={() => send({ type: 'CANCEL' })}
        />
      )}

      {BUSY_STAGES.has(stage) && <BusyStep label={t('busyContacting')} />}
      {stage === 'cancelling' && <BusyStep label={t('busyCancelling')} />}

      {stage === 'choice' && step?.type === 'choice' && (
        <GatewayChoiceStep
          reasonCode={step.data.reasonCode}
          context={step.data.context}
          onUseDefault={() => send({ type: 'CHOICE_USE_DEFAULT' })}
          onCancel={() => send({ type: 'CHOICE_CANCEL' })}
        />
      )}

      {stage === 'qrcode' && step?.type === 'qrcode' && (
        <QrCodeStep
          qrPngBase64={step.data.qrPngBase64}
          instructionKeys={step.data.instructions}
          onContinue={() => send({ type: 'CONFIRM_LINK' })}
          onCancel={() => send({ type: 'CANCEL' })}
        />
      )}

      {stage === 'captcha' && step?.type === 'captcha' && (
        <CaptchaStep onCancel={() => send({ type: 'CANCEL' })} />
      )}

      {stage === 'verifyCode' && step?.type === 'verification_code' && (
        <VerifyCodeStep
          recipient={step.data.recipient}
          channel={step.data.channel}
          onSubmit={(code) => send({ type: 'SUBMIT_CODE', code })}
          onCancel={() => send({ type: 'CANCEL' })}
        />
      )}

      {stage === 'failed' && (
        <FailedStep
          errorCode={state.context.errorCode ?? 'UNKNOWN'}
          errorMessage={state.context.errorMessage ?? ''}
          onRetry={() => send({ type: 'RETRY' })}
          onCancel={() => send({ type: 'CANCEL' })}
        />
      )}
    </Modal>
  );
}
