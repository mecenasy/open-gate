'use client';

import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

const UPDATE_MY_PLATFORM_CREDENTIALS_MUTATION = graphql(`
  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {
    updateMyPlatformCredentials(input: $input) {
      status
      message
    }
  }
`);

export const usePlatformCredentialsUpdate = () => {
  const [doUpdate, { loading }] = useMutation(UPDATE_MY_PLATFORM_CREDENTIALS_MUTATION, {
    refetchQueries: ['TenantPlatformCredentials'],
  });

  const updateCredentials = async (platform: string, config: Record<string, string>) => {
    await doUpdate({ variables: { input: { platform, configJson: JSON.stringify(config) } } });
  };

  return { updateCredentials, isSaving: loading };
};
