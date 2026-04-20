'use client';

import { useMutation } from '@apollo/client/react';
import { GET_HOME_DATA_QUERY, SELECT_SUBSCRIPTION_MUTATION } from './queries';

export const useSelectPlan = () => {
  const [doSelect, { loading }] = useMutation(SELECT_SUBSCRIPTION_MUTATION, {
    refetchQueries: [{ query: GET_HOME_DATA_QUERY }],
  });

  const selectPlan = async (planId: string) => {
    await doSelect({ variables: { input: { planId } } });
  };

  return { selectPlan, isSelecting: loading };
};
