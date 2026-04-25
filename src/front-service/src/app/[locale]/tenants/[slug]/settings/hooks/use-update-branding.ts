'use client';

import { useMutation } from '@apollo/client/react';
import { TENANT_SETTINGS_QUERY, UPDATE_TENANT_BRANDING_MUTATION } from './queries';
import type { TenantBrandingForm } from '../interfaces';

export const useUpdateBranding = (tenantId: string) => {
  const [run, { loading, error }] = useMutation(UPDATE_TENANT_BRANDING_MUTATION, {
    refetchQueries: [{ query: TENANT_SETTINGS_QUERY, variables: { tenantId } }],
  });

  const save = async (form: TenantBrandingForm) => {
    return run({
      variables: {
        input: {
          tenantId,
          logoUrl: form.logoUrl || undefined,
          primaryColor: form.primaryColor || undefined,
          secondaryColor: form.secondaryColor || undefined,
          fontSize: form.fontSize || undefined,
        },
      },
    });
  };

  return { save, isSaving: loading, error };
};
