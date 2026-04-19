'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

const ACCEPT_TFA_MUTATION = graphql(`
  mutation AcceptTfa {
    accept2fa {
      status
      dataUrl
    }
  }
`);

const REJECT_TFA_MUTATION = graphql(`
  mutation RejectTfa {
    reject2fa {
      status
    }
  }
`);

export const use2faToggle = (init: boolean) => {
  const t = useTranslations('auth');
  const [isEnabled, setIsEnabled] = useState(init);
  const [qrCode, setQrCode] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setIsEnabled(init);
  }, [init]);

  const [accept2fa, metaAccept] = useMutation(ACCEPT_TFA_MUTATION);
  const [reject2fa, metaReject] = useMutation(REJECT_TFA_MUTATION);

  const toggle = async (checked: boolean) => {
    setServerError(null);
    setIsEnabled(checked);
    try {
      if (checked) {
        const { data } = await accept2fa();
        setQrCode(data?.accept2fa.dataUrl ?? '');
      } else {
        await reject2fa();
        setQrCode('');
      }
    } catch {
      setServerError(t('tfaWrong'));
    }
  };

  const cancelSetup = async () => {
    try {
      await reject2fa();
    } catch {
      /* ignore */
    }
    setIsEnabled(false);
    setQrCode('');
  };

  const closeQr = () => setQrCode('');

  return {
    isEnabled,
    qrCode,
    serverError,
    toggle,
    cancelSetup,
    closeQr,
    isPending: metaAccept.loading || metaReject.loading,
  };
};
