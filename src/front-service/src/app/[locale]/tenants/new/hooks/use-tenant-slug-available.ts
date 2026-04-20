'use client';

import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { TENANT_SLUG_AVAILABLE_QUERY } from './queries';

export const useTenantSlugAvailable = (slug: string) => {
  const [checkSlug, { data, loading }] = useLazyQuery(TENANT_SLUG_AVAILABLE_QUERY, {
    fetchPolicy: 'network-only',
  });
  const [checkedSlug, setCheckedSlug] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = slug.trim().toLowerCase();
    if (trimmed.length < 3 || !/^[a-z0-9-]+$/.test(trimmed)) {
      setCheckedSlug(null);
      return;
    }
    const timeout = setTimeout(() => {
      checkSlug({ variables: { slug: trimmed } }).then(() => setCheckedSlug(trimmed));
    }, 400);
    return () => clearTimeout(timeout);
  }, [slug, checkSlug]);

  const normalized = slug.trim().toLowerCase();
  const isCurrent = checkedSlug === normalized && normalized.length >= 3;
  return {
    isChecking: loading,
    isAvailable: isCurrent ? Boolean(data?.tenantSlugAvailable) : null,
  };
};
