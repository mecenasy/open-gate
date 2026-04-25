'use client';

import { useMutation } from '@apollo/client/react';
import { TENANT_SETTINGS_QUERY, UPDATE_TENANT_MESSAGING_MUTATION } from './queries';
import type { TenantMessagingForm } from '../interfaces';

export const useUpdateMessaging = (tenantId: string) => {
  const [run, { loading, error }] = useMutation(UPDATE_TENANT_MESSAGING_MUTATION, {
    refetchQueries: [{ query: TENANT_SETTINGS_QUERY, variables: { tenantId } }],
  });

  const save = async (form: TenantMessagingForm) => {
    return run({
      variables: {
        input: {
          tenantId,
          defaultSmsProvider: form.defaultSmsProvider,
          priorityChannels: form.priorityChannels,
          rateLimitPerMinute: form.rateLimitPerMinute,
        },
      },
    });
  };

  return { save, isSaving: loading, error };
};
