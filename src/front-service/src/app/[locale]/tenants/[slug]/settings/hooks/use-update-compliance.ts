'use client';

import { useMutation } from '@apollo/client/react';
import { TENANT_SETTINGS_QUERY, UPDATE_TENANT_COMPLIANCE_MUTATION } from './queries';
import type { TenantComplianceForm } from '../interfaces';

export const useUpdateCompliance = (tenantId: string) => {
  const [run, { loading, error }] = useMutation(UPDATE_TENANT_COMPLIANCE_MUTATION, {
    refetchQueries: [{ query: TENANT_SETTINGS_QUERY, variables: { tenantId } }],
  });

  const save = async (form: TenantComplianceForm) => {
    return run({
      variables: {
        input: {
          tenantId,
          dataResidency: form.dataResidency,
          encryptionEnabled: form.encryptionEnabled,
          webhookUrl: form.webhookUrl,
        },
      },
    });
  };

  return { save, isSaving: loading, error };
};
