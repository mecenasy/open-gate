'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

const ADAPTIVE_LOGIN_MUTATION = graphql(`
  mutation AcceptAdaptiveLogin {
    adaptiveLogin {
      active
    }
  }
`);

export const useAdaptiveLogin = (init: boolean) => {
  const [isEnabled, setIsEnabled] = useState(init);
  const [acceptAdaptiveLogin, { loading }] = useMutation(ADAPTIVE_LOGIN_MUTATION);

  useEffect(() => {
    setIsEnabled(init);
  }, [init]);

  const toggle = async () => {
    const { data } = await acceptAdaptiveLogin();
    setIsEnabled(data?.adaptiveLogin.active ?? false);
  };

  return {
    isEnabled,
    toggle,
    isPending: loading,
  };
};
