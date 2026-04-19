'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { startRegistration } from '@simplewebauthn/browser';
import { graphql } from '@/app/gql';
import { markCurrentDevice, unmarkCurrentDevice } from '../helpers';
import { REMOVE_PASSKEY_MUTATION } from './queries';

const REGISTER_OPTIONS_PASSKEY_MUTATION = graphql(`
  mutation RegisterOptionPasskey {
    registerOptionPasskey
  }
`);

const VERIFY_REGISTRATION_MUTATION = graphql(`
  mutation VerifyRegistration($input: JSON!) {
    registerOptionPasskeyVerify(data: $input) {
      status
    }
  }
`);

export const usePasskeyToggle = () => {
  const [credentialId, setCredentialId] = useState('');

  const refetchQueries = ['GetPasskeys'];
  const [registerOption, metaOption] = useMutation(REGISTER_OPTIONS_PASSKEY_MUTATION);
  const [verifyOption, metaVerify] = useMutation(VERIFY_REGISTRATION_MUTATION, { refetchQueries });
  const [removePasskey, metaRemove] = useMutation(REMOVE_PASSKEY_MUTATION, { refetchQueries });

  const toggle = async (checked: boolean) => {
    if (checked) {
      try {
        const { data } = await registerOption();
        const options = data?.registerOptionPasskey;

        const regResponse = await startRegistration({ optionsJSON: options });
        markCurrentDevice(regResponse.id);

        setCredentialId(regResponse.id ?? '');
        await verifyOption({ variables: { input: regResponse } });
      } catch {
        setCredentialId('');
      }
    } else {
      unmarkCurrentDevice(credentialId);
      removePasskey({ variables: { id: credentialId } });
      setCredentialId('');
    }
  };

  return {
    isEnabled: Boolean(credentialId),
    toggle,
    isPending: metaOption.loading || metaVerify.loading || metaRemove.loading,
  };
};
