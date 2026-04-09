import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { graphql } from '@/app/gql';

export const CORE_CONFIGS_QUERY = graphql(`
  query CoreConfigs {
    coreConfigs {
      data {
        key
        value
        description
      }
      status
      message
    }
  }
`);

const UPDATE_CONFIG_MUTATION = graphql(`
  mutation UpdateConfig($input: UpdateConfigType!) {
    updateConfig(input: $input) {
      status
      message
      data {
        key
        value
      }
    }
  }
`);

export const useCoreConfigs = () => {
  const { data, loading } = useQuery(CORE_CONFIGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  const [updateConfig] = useMutation(UPDATE_CONFIG_MUTATION);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  const toggleConfig = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      await updateConfig({
        variables: { input: { key, value: newValue } },
        refetchQueries: ['CoreConfigs'],
      });
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  console.log("🚀 ~ useCoreConfigs ~ loading:", loading)
  return {
    configs: data?.coreConfigs?.data ?? [],
    isLoading: loading,
    toggleConfig,
    pendingKeys,
  };
};
