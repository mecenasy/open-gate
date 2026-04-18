'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

export type TenantCommandConfigSummary = {
  id: string;
  commandName: string;
  active: boolean;
  userTypes: string[];
  actionsJson?: string | null;
  parametersOverrideJson?: string | null;
  descriptionI18nJson?: string | null;
};

const GET_TENANT_COMMAND_CONFIGS_QUERY = graphql(`
  query GetTenantCommandConfigs {
    tenantCommandConfigs {
      id
      commandName
      active
      userTypes
      actionsJson
      parametersOverrideJson
      descriptionI18nJson
    }
  }
`);

const UPSERT_TENANT_COMMAND_CONFIG_MUTATION = graphql(`
  mutation UpsertTenantCommandConfigMutation($input: UpsertTenantCommandConfigInput!) {
    upsertTenantCommandConfig(input: $input) {
      status
      message
    }
  }
`);

const DELETE_TENANT_COMMAND_CONFIG_MUTATION = graphql(`
  mutation DeleteTenantCommandConfig($input: DeleteTenantCommandConfigInput!) {
    deleteTenantCommandConfig(input: $input) {
      status
      message
    }
  }
`);

export const useTenantCommandConfigs = () => {
  const [selectedConfig, setSelectedConfig] = useState<TenantCommandConfigSummary | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { loading, data } = useQuery(GET_TENANT_COMMAND_CONFIGS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const [doUpsert, { loading: upserting }] = useMutation(UPSERT_TENANT_COMMAND_CONFIG_MUTATION, {
    refetchQueries: ['GetTenantCommandConfigs'],
  });

  const [doDelete] = useMutation(DELETE_TENANT_COMMAND_CONFIG_MUTATION, {
    refetchQueries: ['GetTenantCommandConfigs'],
  });

  const configs = data?.tenantCommandConfigs as TenantCommandConfigSummary[] | undefined;

  const openModal = (config: TenantCommandConfigSummary) => setSelectedConfig(config);
  const closeModal = () => setSelectedConfig(null);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const onUpsert = async (input: {
    commandName: string;
    active: boolean;
    userTypes: string[];
    actionsJson?: string;
    parametersOverrideJson?: string;
    descriptionI18nJson?: string;
  }) => {
    await doUpsert({ variables: { input } });
  };

  const onToggleActive = async (config: TenantCommandConfigSummary, active: boolean) => {
    await doUpsert({
      variables: {
        input: {
          commandName: config.commandName,
          active,
          userTypes: config.userTypes,
          actionsJson: config.actionsJson ?? undefined,
          parametersOverrideJson: config.parametersOverrideJson ?? undefined,
          descriptionI18nJson: config.descriptionI18nJson ?? undefined,
        },
      },
    });
  };

  const onDelete = (commandName: string) => {
    doDelete({ variables: { input: { commandName } } });
  };

  return {
    configs,
    isLoading: loading,
    selectedConfig,
    openModal,
    closeModal,
    onUpsert,
    onToggleActive,
    onDelete,
    isUpserting: upserting,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
  };
};
