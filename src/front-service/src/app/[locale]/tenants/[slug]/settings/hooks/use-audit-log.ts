'use client';

import { useQuery } from '@apollo/client/react';
import { TENANT_AUDIT_LOG_QUERY } from './queries';
import type { AuditEntry } from '../interfaces';

export const useAuditLog = (tenantId: string) => {
  const { data, loading, error } = useQuery(TENANT_AUDIT_LOG_QUERY, {
    variables: { tenantId },
    fetchPolicy: 'cache-and-network',
  });
  return {
    entries: (data?.tenantAuditLog ?? []) as AuditEntry[],
    isLoading: loading,
    error,
  };
};
