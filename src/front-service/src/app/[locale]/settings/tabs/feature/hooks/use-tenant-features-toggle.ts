'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import type { TenantFeatureKey } from '../interfaces';

const UPDATE_TENANT_FEATURES_MUTATION = graphql(`
  mutation UpdateTenantFeatures($input: UpdateTenantFeaturesInput!) {
    updateTenantFeatures(input: $input) {
      status
      message
    }
  }
`);

export const useTenantFeaturesToggle = () => {
  const [updateTenantFeatures] = useMutation(UPDATE_TENANT_FEATURES_MUTATION);
  const [pendingKeys, setPendingKeys] = useState<Set<TenantFeatureKey>>(new Set());

  const toggleFeature = async (key: TenantFeatureKey, currentValue: boolean) => {
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      await updateTenantFeatures({
        variables: { input: { [key]: !currentValue } },
        refetchQueries: ['TenantFeaturesSettings'],
      });
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return { toggleFeature, pendingKeys };
};
