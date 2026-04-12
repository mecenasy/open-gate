// import { useMutation } from '@tanstack/react-query';
import { use, useEffect, useState } from 'react';
// import axios from '../../src/api/api';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { AuthStatus } from '@/app/gql/graphql';
import { graphql } from '@/app/gql';

type TfaStatus =
  | {
      status: AuthStatus.accept2fa;
      dataUrl: string;
    }
  | {
      status: Exclude<AuthStatus, AuthStatus.accept2fa>;
    };

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

export const use2faToggle = (init: boolean, setQrCode: (code: string) => void) => {
  const [isEnabled, setIsEnabled] = useState(init);
  const t = useTranslations('auth');

  useEffect(() => {
    setIsEnabled(init);
  }, [init]);

  const [accept2fa, metaReject] = useMutation(ACCEPT_TFA_MUTATION);
  const [reject2fa, metaAccept] = useMutation(REJECT_TFA_MUTATION);

  const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
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
      alert(t('tfaWrong'));
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

  return {
    isEnabled,
    handleToggleChange,
    cancelSetup,
    isPending: metaAccept.loading || metaReject.loading,
  };
};
