import { assign, fromPromise, setup } from 'xstate';
import type { OnboardingStep } from './interfaces';

export type SignalMode = 'register' | 'link';
export type SignalIntent = 'initial' | 'replace';

export interface SignalFormValues {
  apiUrl?: string;
  account: string;
  mode: SignalMode;
}

export interface SignalMachineInput {
  /** Settings flow when present; wizard flow when omitted. */
  tenantId?: string;
  intent: SignalIntent;
  /** For replace flow — prefilled into params on Start so notify can unregister later. */
  previousAccount?: string;
}

export interface StartCallArgs {
  tenantId?: string;
  paramsJson: string;
}

export interface SubmitCallArgs {
  sessionId: string;
  stepKey: string;
  payloadJson: string;
  tenantId?: string;
  platform: 'signal';
}

/**
 * Caller-supplied bridge between XState actors and Apollo mutations.
 * Keeping these as inputs (rather than a direct GraphQL import inside the
 * machine module) means the machine stays test-friendly and free of
 * framework coupling.
 */
export interface SignalMachineDeps {
  start: (args: StartCallArgs) => Promise<{ sessionId: string; step: OnboardingStep }>;
  submit: (args: SubmitCallArgs) => Promise<{ sessionId: string; step: OnboardingStep }>;
  cancel: (sessionId: string) => Promise<void>;
}

export interface SignalMachineContext {
  tenantId?: string;
  intent: SignalIntent;
  previousAccount?: string;
  form?: SignalFormValues;
  sessionId?: string;
  step?: OnboardingStep;
  errorCode?: string;
  errorMessage?: string;
  /** Captured on `done` — wizard reads this to populate PlatformDraft. */
  credentialsJson?: string;
}

export type SignalMachineEvent =
  | { type: 'SUBMIT_FORM'; values: SignalFormValues }
  | { type: 'CHOICE_USE_DEFAULT' }
  | { type: 'CHOICE_CANCEL' }
  | { type: 'CONFIRM_LINK' }
  | { type: 'CAPTCHA_TOKEN_RECEIVED'; token: string }
  | { type: 'SUBMIT_CODE'; code: string }
  | { type: 'RETRY' }
  | { type: 'CANCEL' };

const buildParamsJson = (ctx: SignalMachineContext): string => {
  const f = ctx.form;
  if (!f) throw new Error('SignalMachine: cannot start without form values.');
  return JSON.stringify({
    apiUrl: f.apiUrl?.trim() || undefined,
    account: f.account,
    mode: f.mode,
    intent: ctx.intent,
    previousAccount: ctx.previousAccount,
  });
};

export const signalOnboardingMachine = (deps: SignalMachineDeps) =>
  setup({
    types: {
      context: {} as SignalMachineContext,
      events: {} as SignalMachineEvent,
      input: {} as SignalMachineInput,
    },
    actors: {
      startOnboarding: fromPromise<{ sessionId: string; step: OnboardingStep }, StartCallArgs>(
        ({ input }) => deps.start(input),
      ),
      submitOnboarding: fromPromise<{ sessionId: string; step: OnboardingStep }, SubmitCallArgs>(
        ({ input }) => deps.submit(input),
      ),
      cancelOnboarding: fromPromise<void, string>(({ input }) => deps.cancel(input)),
    },
    guards: {
      isQrCode: ({ context }) => context.step?.type === 'qrcode',
      isCaptcha: ({ context }) => context.step?.type === 'captcha',
      isVerification: ({ context }) => context.step?.type === 'verification_code',
      isChoice: ({ context }) => context.step?.type === 'choice',
      isDone: ({ context }) => context.step?.type === 'done',
      isError: ({ context }) => context.step?.type === 'error',
    },
    actions: {
      storeForm: assign(({ event }) => {
        if (event.type !== 'SUBMIT_FORM') return {};
        return { form: event.values, errorCode: undefined, errorMessage: undefined };
      }),
      storeStep: assign(({ event }) => {
        // assign is called inside invoke onDone; event.output is the actor's resolved value.
        const out = (event as unknown as { output?: { sessionId: string; step: OnboardingStep } }).output;
        if (!out) return {};
        const next: Partial<SignalMachineContext> = {
          sessionId: out.sessionId,
          step: out.step,
        };
        if (out.step.type === 'done') {
          next.credentialsJson = out.step.data.credentialsJson;
        }
        if (out.step.type === 'error') {
          next.errorCode = out.step.data.code;
          next.errorMessage = out.step.data.message;
        }
        return next;
      }),
      storeError: assign(({ event }) => {
        const err = (event as unknown as { error?: unknown }).error;
        return {
          errorCode: 'NETWORK',
          errorMessage: err instanceof Error ? err.message : String(err ?? 'Network error'),
        };
      }),
    },
  }).createMachine({
    id: 'signalOnboarding',
    initial: 'form',
    context: ({ input }) => ({
      tenantId: input.tenantId,
      intent: input.intent,
      previousAccount: input.previousAccount,
    }),
    states: {
      form: {
        on: {
          SUBMIT_FORM: { target: 'starting', actions: 'storeForm' },
          CANCEL: 'cancelled',
        },
      },
      starting: {
        invoke: {
          src: 'startOnboarding',
          input: ({ context }) => ({
            tenantId: context.tenantId,
            paramsJson: buildParamsJson(context),
          }),
          onDone: { target: 'routing', actions: 'storeStep' },
          onError: { target: 'failed', actions: 'storeError' },
        },
      },
      routing: {
        always: [
          { guard: 'isDone', target: 'done' },
          { guard: 'isError', target: 'failed' },
          { guard: 'isChoice', target: 'choice' },
          { guard: 'isQrCode', target: 'qrcode' },
          { guard: 'isCaptcha', target: 'captcha' },
          { guard: 'isVerification', target: 'verifyCode' },
          { target: 'failed' },
        ],
      },
      choice: {
        on: {
          CHOICE_USE_DEFAULT: 'submittingChoice',
          CHOICE_CANCEL: 'cancelling',
        },
      },
      submittingChoice: {
        invoke: {
          src: 'submitOnboarding',
          input: ({ context }) => ({
            sessionId: context.sessionId!,
            stepKey: context.step!.key,
            payloadJson: JSON.stringify({ choice: 'use_default' }),
            tenantId: context.tenantId,
            platform: 'signal' as const,
          }),
          onDone: { target: 'routing', actions: 'storeStep' },
          onError: { target: 'failed', actions: 'storeError' },
        },
      },
      qrcode: {
        on: {
          CONFIRM_LINK: 'submittingQrConfirm',
          CANCEL: 'cancelling',
        },
      },
      submittingQrConfirm: {
        invoke: {
          src: 'submitOnboarding',
          input: ({ context }) => ({
            sessionId: context.sessionId!,
            stepKey: context.step!.key,
            payloadJson: JSON.stringify({}),
            tenantId: context.tenantId,
            platform: 'signal' as const,
          }),
          onDone: { target: 'routing', actions: 'storeStep' },
          onError: { target: 'failed', actions: 'storeError' },
        },
      },
      captcha: {
        on: {
          CAPTCHA_TOKEN_RECEIVED: 'submittingCaptcha',
          CANCEL: 'cancelling',
        },
      },
      submittingCaptcha: {
        invoke: {
          src: 'submitOnboarding',
          input: ({ context, event }) => ({
            sessionId: context.sessionId!,
            stepKey: context.step!.key,
            payloadJson: JSON.stringify({
              captchaToken: (event as { type: 'CAPTCHA_TOKEN_RECEIVED'; token: string }).token,
            }),
            tenantId: context.tenantId,
            platform: 'signal' as const,
          }),
          onDone: { target: 'routing', actions: 'storeStep' },
          onError: { target: 'failed', actions: 'storeError' },
        },
      },
      verifyCode: {
        on: {
          SUBMIT_CODE: 'submittingCode',
          CANCEL: 'cancelling',
        },
      },
      submittingCode: {
        invoke: {
          src: 'submitOnboarding',
          input: ({ context, event }) => ({
            sessionId: context.sessionId!,
            stepKey: context.step!.key,
            payloadJson: JSON.stringify({
              code: (event as { type: 'SUBMIT_CODE'; code: string }).code,
            }),
            tenantId: context.tenantId,
            platform: 'signal' as const,
          }),
          onDone: { target: 'routing', actions: 'storeStep' },
          onError: { target: 'failed', actions: 'storeError' },
        },
      },
      cancelling: {
        invoke: {
          src: 'cancelOnboarding',
          input: ({ context }) => context.sessionId ?? '',
          onDone: 'cancelled',
          onError: 'cancelled',
        },
      },
      failed: {
        on: {
          RETRY: 'form',
          CANCEL: 'cancelling',
        },
      },
      done: { type: 'final' },
      cancelled: { type: 'final' },
    },
  });

export type SignalOnboardingMachine = ReturnType<typeof signalOnboardingMachine>;
