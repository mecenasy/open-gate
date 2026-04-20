'use client';

import { useQuery } from '@apollo/client/react';
import { GET_HOME_DATA_QUERY } from './queries';

export const useHomeData = () => {
  const { data, loading, error } = useQuery(GET_HOME_DATA_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    subscription: data?.mySubscription ?? null,
    plans: data?.subscriptionPlans ?? [],
    myTenants: data?.myTenants ?? [],
    staffMemberships: data?.tenantsIStaffAt ?? [],
    isLoading: loading && !data,
    error,
  };
};
