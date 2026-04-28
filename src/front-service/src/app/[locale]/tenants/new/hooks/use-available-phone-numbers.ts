'use client';

import { useQuery } from '@apollo/client/react';
import { AVAILABLE_PHONE_NUMBERS_QUERY } from './queries';

export interface AvailablePhoneNumber {
  phoneE164: string;
  capabilities: { sms: boolean; mms: boolean; voice: boolean };
  region?: string | null;
  locality?: string | null;
}

interface Result {
  numbers: AvailablePhoneNumber[];
  isLoading: boolean;
  /** Force the picker to fetch a fresh batch — Twilio rotates inventory and the user can ask for "different ones". */
  refetch: () => Promise<void>;
}

export const useAvailablePhoneNumbers = (country: string, limit = 10): Result => {
  const { data, loading, refetch } = useQuery(AVAILABLE_PHONE_NUMBERS_QUERY, {
    variables: { input: { country, limit, type: 'mobile' } },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  return {
    numbers: (data?.availablePhoneNumbers ?? []) as AvailablePhoneNumber[],
    isLoading: loading,
    refetch: async () => {
      await refetch();
    },
  };
};
