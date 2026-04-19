import { graphql } from '@/app/gql';

export const PASSKEYS_QUERY = graphql(`
  query GetPasskeys {
    getPasskeys {
      id
      createAt
      deviceName
      credentialID
    }
  }
`);

export const REMOVE_PASSKEY_MUTATION = graphql(`
  mutation RemovePasskey($id: String!) {
    removePasskey(id: $id) {
      status
    }
  }
`);
