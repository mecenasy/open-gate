'use client';

import { useQuery } from '@apollo/client/react';
import { GET_BILLING_DATA_QUERY } from './queries';
import type {
  PlanSummary,
  SubscriptionChangeEntry,
  SubscriptionSummary,
  UsageReport,
} from '../interfaces';

export const useBillingData = () => {
  const { data, loading, error } = useQuery(GET_BILLING_DATA_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    subscription: (data?.mySubscription as SubscriptionSummary | null) ?? null,
    plans: (data?.subscriptionPlans as PlanSummary[] | undefined) ?? [],
    usage: (data?.myUsage as UsageReport | undefined) ?? null,
    history: (data?.subscriptionHistory as SubscriptionChangeEntry[] | undefined) ?? [],
    isLoading: loading,
    error,
  };
};
