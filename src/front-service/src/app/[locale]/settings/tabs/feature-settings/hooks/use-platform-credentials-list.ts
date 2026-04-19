'use client';

import { useQuery } from '@apollo/client/react';
import { TENANT_PLATFORM_CREDENTIALS_QUERY } from './queries';

export const usePlatformCredentialsList = () => {
  const { data, loading } = useQuery(TENANT_PLATFORM_CREDENTIALS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  return {
    platforms: data?.tenantPlatformCredentials ?? [],
    isLoading: loading,
  };
};
