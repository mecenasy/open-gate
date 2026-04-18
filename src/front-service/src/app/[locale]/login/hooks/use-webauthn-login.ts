'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { graphql } from '@/app/gql';

const PASSKEY_OPTION_MUTATION = graphql(`
  mutation GetPasskeyOptions {
    optionPasskey
  }
`);

const PASSKEY_VERIFY_MUTATION = graphql(`
  mutation VerifyPasskey($input: JSON!) {
    optionPasskeyVerify(data: $input) {
      status
    }
  }
`);

export const useWebAuthnLogin = () => {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [passkeyOption] = useMutation(PASSKEY_OPTION_MUTATION);
  const [passkeyVerifyOption] = useMutation(PASSKEY_VERIFY_MUTATION, {
    refetchQueries: ['Status'],
  });

  const login = async () => {
    setIsPending(true);
    setServerError(null);
    try {
      const { data } = await passkeyOption();
      const options = data?.optionPasskey;

      const regResponse = await startAuthentication({ optionsJSON: options });

      await passkeyVerifyOption({ variables: { input: regResponse } });
      router.replace('/');
    } catch {
      setServerError(t('loginWrong'));
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, serverError };
};
