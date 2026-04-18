'use client';

import { useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useRouter } from '@/components/navigation/navigation';
import { graphql } from '@/app/gql';

const QR_REJECT_MUTATION = graphql(`
  mutation QrReject ($challenge: String!) {
    qrReject(challenge: $challenge) {
      status
    }
  }
`);

const QR_OPTION_MUTATION = graphql(`
  mutation QrOption ($challenge: String!, $nonce: String!) {
    qrOption(challenge: $challenge, nonce: $nonce)
  }
`);

const QR_CONFIRM_MUTATION = graphql(`
  mutation QrVerify ($challenge: String!, $data: JSON!) {
    qrConfirm(challenge: $challenge, data: $data) {
      status
    }
  }
`);

export const useQrVerify = (challenge: string, nonce: string) => {
  const router = useRouter();
  const [qrReject] = useMutation(QR_REJECT_MUTATION);
  const [qrOption] = useMutation(QR_OPTION_MUTATION);
  const [qrConfirm] = useMutation(QR_CONFIRM_MUTATION);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await qrOption({ variables: { challenge, nonce } });
        const options = data?.qrOption;
        const regResponse = await startAuthentication({ optionsJSON: options });
        await qrConfirm({ variables: { challenge, data: regResponse } });
      } catch {
        await qrReject({ variables: { challenge } });
      } finally {
        router.replace('/thankyou');
      }
    };
    run();
  }, [qrConfirm, qrOption, qrReject, challenge, nonce, router]);
};
