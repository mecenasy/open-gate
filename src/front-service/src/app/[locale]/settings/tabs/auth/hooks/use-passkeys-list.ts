'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { isCurrentDevice, unmarkCurrentDevice } from '../helpers';
import { PASSKEYS_QUERY, REMOVE_PASSKEY_MUTATION } from './queries';

export const usePasskeysList = () => {
  const { data, loading } = useQuery(PASSKEYS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const keys = data?.getPasskeys;

  const hasLocalDevice = Boolean(keys?.some((key) => isCurrentDevice(key.credentialID)));

  const [removePasskey] = useMutation(REMOVE_PASSKEY_MUTATION, {
    refetchQueries: ['GetPasskeys'],
  });

  const removeKey = async (id: string, credentialID: string) => {
    await removePasskey({ variables: { id } });
    if (isCurrentDevice(credentialID)) {
      unmarkCurrentDevice(credentialID);
    }
  };

  return { keys, isLoading: loading, hasLocalDevice, removeKey };
};
