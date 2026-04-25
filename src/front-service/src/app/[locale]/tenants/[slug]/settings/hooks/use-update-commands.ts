'use client';

import { useMutation } from '@apollo/client/react';
import { TENANT_SETTINGS_QUERY, UPDATE_TENANT_COMMANDS_MUTATION } from './queries';
import type { TenantCommandsForm } from '../interfaces';

export const useUpdateCommands = (tenantId: string) => {
  const [run, { loading, error }] = useMutation(UPDATE_TENANT_COMMANDS_MUTATION, {
    refetchQueries: [{ query: TENANT_SETTINGS_QUERY, variables: { tenantId } }],
  });

  const save = async (form: TenantCommandsForm) => {
    return run({ variables: { input: { tenantId, ...form } } });
  };

  return { save, isSaving: loading, error };
};
