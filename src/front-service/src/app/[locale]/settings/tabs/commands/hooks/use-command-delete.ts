'use client';

import { useMutation } from '@apollo/client/react';
import { DELETE_TENANT_COMMAND_CONFIG_MUTATION } from './queries';

export const useCommandDelete = () => {
  const [doDelete, { loading }] = useMutation(DELETE_TENANT_COMMAND_CONFIG_MUTATION, {
    refetchQueries: ['GetTenantCommandConfigs'],
  });

  const deleteCommand = async (commandName: string) => {
    await doDelete({ variables: { input: { commandName } } });
  };

  return { deleteCommand, isDeleting: loading };
};
