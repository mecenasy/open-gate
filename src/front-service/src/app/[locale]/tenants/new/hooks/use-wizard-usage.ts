'use client';

import { useQuery } from '@apollo/client/react';
import { WIZARD_USAGE_QUERY } from './queries';

interface WizardUsage {
  tenants: number;
  maxTenants: number;
  maxPlatformsPerTenant: number;
  maxContactsPerTenant: number;
  maxCustomCommandsPerTenant: number;
  isLoading: boolean;
}

export const useWizardUsage = (): WizardUsage => {
  const { data, loading } = useQuery(WIZARD_USAGE_QUERY, { fetchPolicy: 'cache-and-network' });
  const plan = data?.mySubscription?.plan;
  return {
    tenants: data?.myUsage?.tenants ?? 0,
    maxTenants: plan?.maxTenants ?? 0,
    maxPlatformsPerTenant: plan?.maxPlatformsPerTenant ?? 0,
    maxContactsPerTenant: plan?.maxContactsPerTenant ?? 0,
    maxCustomCommandsPerTenant: plan?.maxCustomCommandsPerTenant ?? 0,
    isLoading: loading,
  };
};
