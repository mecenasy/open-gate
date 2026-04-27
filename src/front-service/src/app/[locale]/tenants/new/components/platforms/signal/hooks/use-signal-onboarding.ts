'use client';

import { useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useMachine } from '@xstate/react';
import { CANCEL_PLATFORM_ONBOARDING, START_PLATFORM_ONBOARDING, SUBMIT_PLATFORM_ONBOARDING } from './queries';
import type { OnboardingStepResponse } from '../interfaces';
import { parseOnboardingStep } from '../helpers';
import {
  signalOnboardingMachine,
  type SignalIntent,
  type SignalMachineDeps,
} from '../signal-onboarding.machine';

interface UseSignalOnboardingArgs {
  tenantId?: string;
  intent: SignalIntent;
  previousAccount?: string;
}

/**
 * Wires Apollo mutations into the XState machine. Returns the live `state`
 * and a `send` function — components stay declarative and just react to
 * `state.value`.
 */
export function useSignalOnboarding(args: UseSignalOnboardingArgs) {
  const [startMutation] = useMutation(START_PLATFORM_ONBOARDING);
  const [submitMutation] = useMutation(SUBMIT_PLATFORM_ONBOARDING);
  const [cancelMutation] = useMutation(CANCEL_PLATFORM_ONBOARDING);

  const deps = useMemo<SignalMachineDeps>(
    () => ({
      start: async ({ tenantId, paramsJson }) => {
        const res = await startMutation({
          variables: { input: { tenantId, platform: 'signal', paramsJson } },
        });
        const data = res.data?.startPlatformOnboarding;
        if (!data) throw new Error('startPlatformOnboarding returned no data');
        return { sessionId: data.sessionId, step: parseOnboardingStep(data as OnboardingStepResponse) };
      },
      submit: async ({ sessionId, stepKey, payloadJson, tenantId, platform }) => {
        const res = await submitMutation({
          variables: { input: { sessionId, stepKey, payloadJson, tenantId, platform } },
        });
        const data = res.data?.submitPlatformOnboarding;
        if (!data) throw new Error('submitPlatformOnboarding returned no data');
        return { sessionId: data.sessionId, step: parseOnboardingStep(data as OnboardingStepResponse) };
      },
      cancel: async (sessionId) => {
        if (!sessionId) return;
        await cancelMutation({ variables: { sessionId } });
      },
    }),
    [startMutation, submitMutation, cancelMutation],
  );

  const machine = useMemo(() => signalOnboardingMachine(deps), [deps]);

  const [state, send] = useMachine(machine, {
    input: {
      tenantId: args.tenantId,
      intent: args.intent,
      previousAccount: args.previousAccount,
    },
  });

  return { state, send };
}
