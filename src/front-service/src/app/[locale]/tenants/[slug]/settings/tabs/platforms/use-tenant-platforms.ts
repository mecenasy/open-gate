'use client';

import { useQuery } from '@apollo/client/react';
import { TENANT_PLATFORM_CREDENTIALS_QUERY } from './queries';

export interface TenantPlatformCredential {
  platform: string;
  configJson: string;
  isDefault: boolean;
}

export interface UseTenantPlatformsResult {
  platforms: TenantPlatformCredential[];
  loading: boolean;
  refetch: () => Promise<unknown>;
}

export function useTenantPlatforms(): UseTenantPlatformsResult {
  const { data, loading, refetch } = useQuery(TENANT_PLATFORM_CREDENTIALS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  return {
    platforms: (data?.tenantPlatformCredentials ?? []) as TenantPlatformCredential[],
    loading,
    refetch,
  };
}
