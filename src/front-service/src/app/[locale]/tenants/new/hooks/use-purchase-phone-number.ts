'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { PURCHASE_PHONE_NUMBER_MUTATION } from './queries';

export interface PurchaseInput {
  country: string;
  phoneE164: string;
}

export interface PurchaseResult {
  pendingId: string;
  phoneE164: string;
}

interface Result {
  purchase: (input: PurchaseInput) => Promise<PurchaseResult | null>;
  isPurchasing: boolean;
  error: string | null;
}

export const usePurchasePhoneNumber = (): Result => {
  const [doPurchase, { loading }] = useMutation(PURCHASE_PHONE_NUMBER_MUTATION);
  const [error, setError] = useState<string | null>(null);

  const purchase = async (input: PurchaseInput): Promise<PurchaseResult | null> => {
    setError(null);
    try {
      const res = await doPurchase({ variables: { input } });
      const entry = res.data?.purchasePhoneNumber;
      if (!entry) {
        setError('Purchase did not return a pending row.');
        return null;
      }
      return { pendingId: entry.id, phoneE164: entry.phoneE164 };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  return { purchase, isPurchasing: loading, error };
};
