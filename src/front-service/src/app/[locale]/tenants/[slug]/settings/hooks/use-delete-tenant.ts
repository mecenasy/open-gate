'use client';

import { useApolloClient, useMutation } from '@apollo/client/react';
import { DELETE_TENANT_MUTATION } from './queries';

export const useDeleteTenant = () => {
  const client = useApolloClient();
  const [run, { loading, error }] = useMutation(DELETE_TENANT_MUTATION);

  const deleteTenant = async (tenantId: string, slugConfirmation: string) => {
    const result = await run({ variables: { input: { tenantId, slugConfirmation } } });
    await client.refetchQueries({ include: 'active' });
    return result;
  };

  return { deleteTenant, isDeleting: loading, error };
};
