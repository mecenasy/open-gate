'use client';

import { useQuery } from '@apollo/client/react';
import { SIGNAL_VERIFICATION_CODE_QUERY } from './queries';

const POLL_INTERVAL_MS = 2000;

interface Result {
  code: string | null;
  receivedAt: string | null;
  isLoading: boolean;
}

/**
 * Polls the BFF every 2s for a verification code recorded by the Twilio
 * webhook. The user is in the managed flow so the SMS lands on a number
 * we own — there's no inbox they can read it from. We auto-fill the
 * verify input from this query when it returns a non-null code.
 *
 * `enabled` gates polling: the picker step doesn't need to spam the
 * resolver. Pass `false` outside of the verifyCode step.
 */
export const useSignalVerificationCode = (pendingId: string | null, enabled: boolean): Result => {
  const { data, loading } = useQuery(SIGNAL_VERIFICATION_CODE_QUERY, {
    variables: { pendingId: pendingId ?? '' },
    skip: !enabled || !pendingId,
    pollInterval: enabled && pendingId ? POLL_INTERVAL_MS : 0,
    fetchPolicy: 'network-only',
  });
  const recorded = data?.signalVerificationCodeForPending;
  return {
    code: recorded?.code ?? null,
    receivedAt: recorded?.receivedAt ?? null,
    isLoading: loading,
  };
};
