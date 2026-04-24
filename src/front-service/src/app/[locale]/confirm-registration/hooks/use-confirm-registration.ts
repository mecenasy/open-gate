'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

const CONFIRM_REGISTRATION_MUTATION = graphql(`
  mutation ConfirmRegistration($token: String!) {
    confirmRegistration(token: $token) {
      success
    }
  }
`);

type State = 'verifying' | 'success' | 'error';

export const useConfirmRegistration = (token: string | null) => {
  console.log("🚀 ~ useConfirmRegistration ~ token:", token)
  const [state, setState] = useState<State>('verifying');
  const [confirmMutation] = useMutation(CONFIRM_REGISTRATION_MUTATION);

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await confirmMutation({ variables: { token } });
        console.log("🚀 ~ useConfirmRegistration ~ data:", data)
        if (cancelled) return;
        setState(data?.confirmRegistration?.success ? 'success' : 'error');
      } catch {
        if (!cancelled) setState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, confirmMutation]);

  return { state };
};
