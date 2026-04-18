import { graphql } from '@/app/gql';

export const GET_USERS_QUERY = graphql(`
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
