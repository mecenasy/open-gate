"use client";
import { useMutation } from '@apollo/client/react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useTranslations } from 'next-intl';
import { useRouter } from '../components/navigation/navigation';
import { graphql } from '@/app/gql';

const PASSKEY_OPTION_MUTATION = graphql(`
  mutation GetPasskeyOptions {
    optionPasskey
  }
`);

export const PASSKEY_VERIFY_MUTATION = graphql(`
  mutation VerifyPasskey($input: JSON!) {
    optionPasskeyVerify(data: $input) {
      status
    }
  }
`);

export const useWebAuthnLogin = () => {
  const t = useTranslations('auth')
  const router = useRouter();
  const [passkeyOption] = useMutation(PASSKEY_OPTION_MUTATION);
  const [passkeyVerifyOption] = useMutation(PASSKEY_VERIFY_MUTATION);

  const handleToggleChange = async () => {
    try {
      const { data } = await passkeyOption()
      const options = data?.optionPasskey

      const regResponse = await startAuthentication({ optionsJSON: options });

      await passkeyVerifyOption({ variables: { input: regResponse } });

      router.replace('/');
    } catch {
      alert(t('loginWrong'));
    }
  };

  return {
    handleToggleChange,
  };
}
