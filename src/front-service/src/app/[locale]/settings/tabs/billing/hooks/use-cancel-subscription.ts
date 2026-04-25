'use client';

import { useMutation } from '@apollo/client/react';
import { CANCEL_SUBSCRIPTION_MUTATION, GET_BILLING_DATA_QUERY } from './queries';

export const useCancelSubscription = () => {
  const [doCancel, { loading, error, reset }] = useMutation(CANCEL_SUBSCRIPTION_MUTATION, {
    refetchQueries: [{ query: GET_BILLING_DATA_QUERY }, 'Status'],
  });

  const cancelSubscription = async () => {
    return doCancel();
  };

  return { cancelSubscription, isCanceling: loading, error, reset };
};
