'use client';

import { usePathname, useRouter } from '../components/navigation/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { AuthStatus } from '@/app/gql/graphql';

const STATUS_QUERY = graphql(`
  query Status {
    loginStatus {
      status
      phoneId
      user {
        id
        email
        is2faEnabled
        isAdaptiveLoginEnabled
        admin
      }
    }
  }
`);

const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    logoutUser {
      status
    }
  }
`);

export const useAuth = () => {
  const router = useRouter();
  const path = usePathname();
  const { data, loading, error, refetch } = useQuery(STATUS_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip:
      path.includes('qr-verify') ||
      /\/login\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(path),
  });

  const status = data?.loginStatus.status;
  const user = data?.loginStatus.user;
  const phoneId = data?.loginStatus.phoneId;

  const [logoutUser] = useMutation(LOGOUT_MUTATION, {
    refetchQueries: ['Status'],
  });

  const logout = async () => {
    await logoutUser();
    router.replace('/');
  };

  return {
    isLoading: loading && !data,
    isError: error,
    isAuthenticated: status === AuthStatus.Login,
    user: user,
    phoneId,
    logout,
    refetch,
  };
};
