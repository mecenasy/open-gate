'use client';

import { useLazyQuery } from '@apollo/client/react';
import { PREVIEW_PLAN_CHANGE_QUERY } from './queries';
import type { PlanChangePreview } from '../interfaces';

export const usePreviewPlanChange = () => {
  const [run, { data, loading, error }] = useLazyQuery(PREVIEW_PLAN_CHANGE_QUERY, {
    fetchPolicy: 'network-only',
  });

  const preview = async (newPlanId: string): Promise<PlanChangePreview | null> => {
    const result = await run({ variables: { newPlanId } });
    return (result.data?.previewPlanChange as PlanChangePreview | undefined) ?? null;
  };

  return {
    preview,
    result: (data?.previewPlanChange as PlanChangePreview | undefined) ?? null,
    isLoading: loading,
    error,
  };
};
