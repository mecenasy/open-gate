'use client';

import { useQuery } from '@apollo/client/react';
import { TENANT_FEATURES_QUERY } from './queries';

export const useTenantFeaturesList = () => {
  const { data, loading } = useQuery(TENANT_FEATURES_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  return {
    features: data?.tenantFeatures,
    isLoading: loading,
  };
};
