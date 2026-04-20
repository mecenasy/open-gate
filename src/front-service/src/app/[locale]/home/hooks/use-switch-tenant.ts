'use client';

import { useMutation } from '@apollo/client/react';
import { SWITCH_TENANT_MUTATION } from './queries';

export const useSwitchTenant = () => {
  const [doSwitch, { loading }] = useMutation(SWITCH_TENANT_MUTATION, {
    refetchQueries: ['Status'],
  });

  const switchTenant = async (tenantId: string) => {
    await doSwitch({ variables: { tenantId } });
  };

  return { switchTenant, isSwitching: loading };
};
