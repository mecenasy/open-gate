'use client';

import { useQuery } from '@apollo/client/react';
import { PHONE_PROCUREMENT_INFO_QUERY } from './queries';

interface PhoneProcurementInfo {
  providerKey: string;
  /** True when notify-service runs the mock provider — UI shows a sandbox banner. */
  isSandbox: boolean;
  isLoading: boolean;
}

export const usePhoneProcurementInfo = (): PhoneProcurementInfo => {
  const { data, loading } = useQuery(PHONE_PROCUREMENT_INFO_QUERY, { fetchPolicy: 'cache-first' });
  return {
    providerKey: data?.phoneProcurementInfo?.providerKey ?? '',
    isSandbox: data?.phoneProcurementInfo?.isSandbox ?? false,
    isLoading: loading,
  };
};
