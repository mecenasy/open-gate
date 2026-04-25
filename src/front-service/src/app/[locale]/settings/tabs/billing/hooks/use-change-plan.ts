'use client';

import { useMutation } from '@apollo/client/react';
import { CHANGE_PLAN_MUTATION, GET_BILLING_DATA_QUERY } from './queries';

export const useChangePlan = () => {
  const [doChange, { loading, error, reset }] = useMutation(CHANGE_PLAN_MUTATION, {
    refetchQueries: [{ query: GET_BILLING_DATA_QUERY }, 'Status'],
  });

  const changePlan = async (planId: string) => {
    return doChange({ variables: { input: { planId } } });
  };

  return { changePlan, isSaving: loading, error, reset };
};
