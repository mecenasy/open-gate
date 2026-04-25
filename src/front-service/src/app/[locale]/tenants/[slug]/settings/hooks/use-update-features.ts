'use client';

import { useMutation } from '@apollo/client/react';
import { TENANT_SETTINGS_QUERY, UPDATE_TENANT_FEATURES_MUTATION } from './queries';
import type { TenantFeaturesForm } from '../interfaces';

export const useUpdateFeatures = (tenantId: string) => {
  const [run, { loading, error }] = useMutation(UPDATE_TENANT_FEATURES_MUTATION, {
    refetchQueries: [{ query: TENANT_SETTINGS_QUERY, variables: { tenantId } }, 'Status'],
  });

  const save = async (form: TenantFeaturesForm) => {
    return run({ variables: { input: { tenantId, ...form } } });
  };

  return { save, isSaving: loading, error };
};
