'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { io, Socket } from 'socket.io-client';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/components/navigation/navigation';
import { graphql } from '@/app/gql';

const CHALLENGE_MUTATION = graphql(`
  mutation QrChallenge($nonce: String!) {
    qrChallenge(nonce: $nonce) {
      challenge
      dataUrl
    }
  }
`);

const LOGIN_MUTATION = graphql(`
  mutation QrLogin($challenge: String!, $nonce: String!) {
    qrLogin(challenge: $challenge, nonce: $nonce) {
      status
    }
  }
`);

export const useQrCodeLogin = (onClose: () => void) => {
  const [nonce] = useState(() => crypto.randomUUID());
  const [serverError, setServerError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const t = useTranslations('qrCode');

  const [runChallenge, { data, loading }] = useMutation(CHALLENGE_MUTATION, {
    variables: { nonce },
  });
  const [qrLogin] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    runChallenge({ variables: { nonce } });
  }, [nonce, runChallenge]);

  const challenge = data?.qrChallenge?.challenge;
  const dataUrl = data?.qrChallenge?.dataUrl;

  useEffect(() => {
    if (!challenge) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_HOST_URL}/getaway`, {
      query: { challenge },
      transports: ['websocket'],
    });

    socketRef.current.on('challenge', async ({ status, type, ...rest }) => {
      if (rest.nonce === nonce && type === 'QR-AUTH') {
        switch (status) {
          case 'verified':
            await qrLogin({ variables: { challenge, nonce } });
            router.replace('/');
            break;
          case 'rejected':
            setServerError(t('canceled'));
            onClose();
            break;
          default:
            setServerError(t('error'));
            onClose();
            break;
        }
      } else {
        setServerError(t('alert'));
      }

      socketRef.current?.close();
    });

    return () => {
      socketRef.current?.close();
    };
  }, [challenge, qrLogin, t, router, nonce, onClose]);

  return { dataUrl, isLoading: loading || !dataUrl, serverError };
};
