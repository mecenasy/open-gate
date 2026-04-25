'use client';

import { useApolloClient, useMutation } from '@apollo/client/react';
import { SET_TENANT_ACTIVE_MUTATION } from './queries';

export const useSetTenantActive = () => {
  const client = useApolloClient();
  const [run, { loading, error }] = useMutation(SET_TENANT_ACTIVE_MUTATION);

  const setActive = async (tenantId: string, active: boolean) => {
    const result = await run({ variables: { input: { tenantId, active } } });
    await client.refetchQueries({ include: 'active' });
    return result;
  };

  return { setActive, isSaving: loading, error };
};
