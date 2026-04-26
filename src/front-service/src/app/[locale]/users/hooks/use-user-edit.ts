'use client';

import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { UpdateUserType, UserRole, UserStatus } from '@/app/gql/graphql';
import type { UserSummary } from '../interfaces';
import { GET_USERS_QUERY } from './queries';

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

export const useUserEdit = () => {
  const refetchQueries = [{ query: GET_USERS_QUERY }];

  const [doUpdateUser, { loading }] = useMutation(UPDATE_USER_MUTATION, { refetchQueries });
  const [doUpdateStatus] = useMutation(UPDATE_USER_STATUS_MUTATION, { refetchQueries });
  const [doUpdateRole] = useMutation(UPDATE_USER_ROLE_MUTATION, { refetchQueries });
  const [doRemoveUser] = useMutation(REMOVE_USER_MUTATION, { refetchQueries });

  const updateUser = async (
    current: UserSummary,
    next: Omit<UpdateUserType, 'id'> & { status: UserStatus; type: UserRole },
  ) => {
    const { status, type, ...rest } = next;
    const tasks: Promise<unknown>[] = [doUpdateUser({ variables: { input: { ...rest, id: current.id } } })];
    if (status !== current.status) {
      tasks.push(doUpdateStatus({ variables: { input: { id: current.id, status } } }));
    }
    if (type !== current.type) {
      tasks.push(doUpdateRole({ variables: { input: { id: current.id, type } } }));
    }
    await Promise.all(tasks);
  };

  const removeUser = (id: string) => {
    doRemoveUser({ variables: { input: { id } } });
  };

  return { updateUser, removeUser, isUpdating: loading };
};
