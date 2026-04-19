'use client';

import { useQuery } from '@apollo/client/react';
import type { CommandConfigSummary } from '../interfaces';
import { GET_TENANT_COMMAND_CONFIGS_QUERY } from './queries';

export const useCommandsList = () => {
  const { loading, data } = useQuery(GET_TENANT_COMMAND_CONFIGS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    configs: data?.tenantCommandConfigs as CommandConfigSummary[] | undefined,
    isLoading: loading,
  };
};
