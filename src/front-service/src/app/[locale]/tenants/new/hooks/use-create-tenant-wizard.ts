'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  ADD_CONTACT_WIZARD_MUTATION,
  CREATE_TENANT_MUTATION,
  SWITCH_TENANT_WIZARD_MUTATION,
  UPDATE_TENANT_FEATURES_WIZARD_MUTATION,
} from './queries';
import type { ContactDraft, TenantFeaturesDraft } from '../interfaces';

interface SubmitInput {
  slug: string;
  features: TenantFeaturesDraft;
  contacts: ContactDraft[];
}

export const useCreateTenantWizard = () => {
  const [doCreate] = useMutation(CREATE_TENANT_MUTATION, {
    refetchQueries: ['GetMyTenants', 'GetTenantsIStaffAt'],
  });
  const [doSwitch] = useMutation(SWITCH_TENANT_WIZARD_MUTATION);
  const [doFeatures] = useMutation(UPDATE_TENANT_FEATURES_WIZARD_MUTATION);
  const [doContact] = useMutation(ADD_CONTACT_WIZARD_MUTATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (input: SubmitInput): Promise<string | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const createRes = await doCreate({
        variables: { input: { slug: input.slug.trim().toLowerCase() } },
      });
      const tenantId = createRes.data?.createTenant.id;
      if (!tenantId) throw new Error('Tenant not created');

      await doSwitch({ variables: { tenantId } });

      await doFeatures({ variables: { input: { tenantId, ...input.features } } });

      for (const c of input.contacts) {
        await doContact({
          variables: {
            input: {
              tenantId,
              name: c.name,
              surname: c.surname || null,
              email: c.email || null,
              phone: c.phone || null,
              accessLevel: c.accessLevel,
            },
          },
        });
      }

      return tenantId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error };
};
