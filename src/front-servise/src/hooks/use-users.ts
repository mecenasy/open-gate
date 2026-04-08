'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { UserRole, UserStatus } from '@/app/gql/graphql';

export type UserSummary = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  status: UserStatus | '%future added value';
  type: UserRole | '%future added value';
};

const GET_USERS_QUERY = graphql(`
  query GetUsers($input: GetAllUsersType) {
    users(input: $input) {
      users {
        id
        name
        surname
        email
        phone
        status
        type
      }
      total
    }
  }
`);

const UPDATE_USER_MUTATION = graphql(`
  mutation UpdateUser($input: UpdateUserType!) {
    updateUser(input: $input) {
      id
      name
      surname
      email
      phone
      status
      type
    }
  }
`);

const UPDATE_USER_STATUS_MUTATION = graphql(`
  mutation UpdateUserStatus($input: UpdateUserStatusType!) {
    updateUserStatus(input: $input) {
      id
      name
      surname
      email
      phone
      status
      type
    }
  }
`);

const UPDATE_USER_ROLE_MUTATION = graphql(`
  mutation UpdateUserRole($input: UpdateUserRoleType!) {
    updateUserRole(input: $input) {
      id
      name
      surname
      email
      phone
      status
      type
    }
  }
`);

const REMOVE_USER_MUTATION = graphql(`
  mutation RemoveUser($input: GetUserType!) {
    removeUser(input: $input) {
      success
    }
  }
`);

export const useUsers = () => {
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  const { loading, data } = useQuery(GET_USERS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const [doUpdateUser, { loading: updatingUser }] = useMutation(UPDATE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],

  });

  const [doUpdateStatus] = useMutation(UPDATE_USER_STATUS_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const [doUpdateRole] = useMutation(UPDATE_USER_ROLE_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const users = data?.users.users;

  const isLoading = loading || updatingUser;


  const [doRemoveUser] = useMutation(REMOVE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const openModal = (user: UserSummary) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const onUpdateUser = async (input: { name?: string; surname?: string; email?: string; phone?: string }) => {
    if (!selectedUser) return;
    await doUpdateUser({ variables: { input: { id: selectedUser.id, ...input } } });
  };

  const onUpdateStatus = (id: string, status: UserStatus) => {
    return doUpdateStatus({ variables: { input: { id, status } } });
  };

  const onUpdateRole = (id: string, type: UserRole) => {
    return doUpdateRole({ variables: { input: { id, type } } });
  };

  const onRemoveUser = (id: string) => {
    doRemoveUser({ variables: { input: { id } } });
  };

  return {
    users,
    isLoading: isLoading,
    selectedUser,
    openModal,
    closeModal,
    onUpdateUser,
    onUpdateStatus,
    onUpdateRole,
    onRemoveUser,
    isUpdatingUser: updatingUser,
  };
};
