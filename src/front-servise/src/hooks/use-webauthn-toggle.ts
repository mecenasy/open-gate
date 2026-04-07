import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { graphql } from '@/app/gql';

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

export const REMOVE_PASSKEY_MUTATION = graphql(`
  mutation RemovePasskey($id: String!) {
    removePasskey(id: $id) {
      status
    }
  }
`);

export const useWebauthnToggle = (setShow: (show: boolean) => void) => {
  const [credentialId, setCredentialId] = useState('');

  const [registerOption, metaOption] = useMutation(REGISTER_OPTIONS_PASSKEY_MUTATION);
  const [verifyOption, metaVerify] = useMutation(VERIFY_REGISTRATION_MUTATION);
  const [removePasskey, metaRemove] = useMutation(REMOVE_PASSKEY_MUTATION);

  const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {

      try {
        const { data } = await registerOption()
        const options = data?.registerOptionPasskey

        const regResponse = await startRegistration({ optionsJSON: options });
        localStorage.setItem(`webauthn_${regResponse.id}`, 'true');

        setShow(!regResponse);
        setCredentialId(regResponse.id ?? '');
        await verifyOption({ variables: { input: regResponse } });

      } catch (error) {
        console.error('Błąd biometrii:', error);
        setCredentialId('');
      }
    } else {
      localStorage.removeItem(`webauthn_${credentialId}`)
      removePasskey({ variables: { id: credentialId } });
      setCredentialId('');
    }
  };

  return {
    isEnabled: Boolean(credentialId),
    handleToggleChange,
    isPending: metaOption.loading || metaVerify.loading || metaRemove.loading,
  }
}