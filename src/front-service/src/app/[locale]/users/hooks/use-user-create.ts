'use client';

import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { CreateSimpleUserType } from '@/app/gql/graphql';
import { GET_USERS_QUERY } from './queries';

const CREATE_USER_MUTATION = graphql(`
  mutation CreateSimpleUser($input: CreateSimpleUserType!) {
    createSimpleUser(input: $input) {
      id
      email
    }
  }
`);

export const useUserCreate = () => {
  const [doCreateUser, { loading }] = useMutation(CREATE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const createUser = async (input: CreateSimpleUserType) => {
    await doCreateUser({ variables: { input } });
  };

  return { createUser, isCreating: loading };
};
