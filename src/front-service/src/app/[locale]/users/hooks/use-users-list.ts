'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USERS_QUERY } from './queries';

export const useUsersList = () => {
  const { loading, data } = useQuery(GET_USERS_QUERY, { fetchPolicy: 'cache-and-network' });
  return {
    users: data?.users.users,
    isLoading: loading,
  };
};
