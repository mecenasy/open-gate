'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { graphql } from '@/app/gql';

const TENANT_FEATURES_QUERY = graphql(`
  query TenantFeaturesSettings {
    tenantFeatures {
      enableSignal
      enableWhatsApp
      enableMessenger
      enableGate
      enablePayment
      enableCommandScheduling
      enableAnalytics
      enableAudioRecognition
      maxUsersPerTenant
    }
  }
`);

const UPDATE_TENANT_FEATURES_MUTATION = graphql(`
  mutation UpdateTenantFeatures($input: UpdateTenantFeaturesInput!) {
    updateTenantFeatures(input: $input) {
      status
      message
    }
  }
`);

export type TenantFeatureKey =
  | 'enableSignal'
  | 'enableWhatsApp'
  | 'enableMessenger'
  | 'enableGate'
  | 'enablePayment'
  | 'enableCommandScheduling'
  | 'enableAnalytics'
  | 'enableAudioRecognition';

export const useTenantFeatures = () => {
  const { data, loading } = useQuery(TENANT_FEATURES_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const [updateTenantFeatures] = useMutation(UPDATE_TENANT_FEATURES_MUTATION);
  const [pendingKeys, setPendingKeys] = useState<Set<TenantFeatureKey>>(new Set());

  const features = data?.tenantFeatures;

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

  return {
    features,
    isLoading: loading,
    toggleFeature,
    pendingKeys,
  };
};
