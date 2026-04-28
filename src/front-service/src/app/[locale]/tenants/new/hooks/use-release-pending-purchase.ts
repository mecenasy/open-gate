'use client';

import { useMutation } from '@apollo/client/react';
import { RELEASE_PENDING_PURCHASE_MUTATION } from './queries';

interface Result {
  release: (pendingId: string) => Promise<boolean>;
  isReleasing: boolean;
}

export const useReleasePendingPurchase = (): Result => {
  const [doRelease, { loading }] = useMutation(RELEASE_PENDING_PURCHASE_MUTATION);

  const release = async (pendingId: string): Promise<boolean> => {
    try {
      const res = await doRelease({ variables: { pendingId } });
      return res.data?.releasePendingPurchase ?? false;
    } catch {
      // Caller logs / retries — the cleanup cron is the floor.
      return false;
    }
  };

  return { release, isReleasing: loading };
};
