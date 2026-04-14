'use client';

import { useQuery } from '@apollo/client/react';
import { graphql } from '@/app/gql';

const TENANT_FEATURES_QUERY = graphql(`
  query TenantFeatures {
    tenantFeatures {
      enableSignal
      enableWhatsApp
      enableMessenger
      enableGate
      enablePayment
      enableCommandScheduling
      enableAnalytics
      maxUsersPerTenant
    }
  }
`);

export interface TenantFeatures {
  enableSignal: boolean;
  enableWhatsApp: boolean;
  enableMessenger: boolean;
  enableGate: boolean;
  enablePayment: boolean;
  enableCommandScheduling: boolean;
  enableAnalytics: boolean;
  maxUsersPerTenant: number;
}

const DEFAULT_FEATURES: TenantFeatures = {
  enableSignal: false,
  enableWhatsApp: false,
  enableMessenger: false,
  enableGate: true,
  enablePayment: false,
  enableCommandScheduling: true,
  enableAnalytics: false,
  maxUsersPerTenant: 1000,
};

export const useTenant = () => {
  const { data, loading, error } = useQuery(TENANT_FEATURES_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const raw = data?.tenantFeatures;

  return {
    features: (raw as TenantFeatures | undefined) ?? DEFAULT_FEATURES,
    isLoading: loading && !data,
    isError: !!error,
  };
};
