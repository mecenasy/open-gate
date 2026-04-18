'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { PromptUserType } from '@/app/gql/graphql';

export type PromptSummary = {
  id: string;
  commandId?: string;
  commandName?: string;
  userType: string;
  descriptionI18n?: Record<string, string>;
  prompt: string;
};

export type CommandOption = {
  value: string;
  label: string;
};

const GET_TENANT_PROMPT_OVERRIDES_QUERY = graphql(`
  query GetTenantPromptOverrides {
    tenantPromptOverrides {
      id
      commandId
      userType
      descriptionI18nJson
      prompt
    }
  }
`);

const GET_TENANT_COMMAND_CONFIGS_FOR_PROMPTS_QUERY = graphql(`
  query GetTenantCommandConfigsForPrompts {
    tenantCommandConfigs {
      id
      commandName
    }
  }
`);

const UPSERT_TENANT_PROMPT_OVERRIDE_MUTATION = graphql(`
  mutation UpsertTenantPromptOverride($input: UpsertTenantPromptOverrideInput!) {
    upsertTenantPromptOverride(input: $input) {
      status
      message
    }
  }
`);

export type PromptOverrideForm = {
  commandId?: string;
  userType: PromptUserType;
  descriptionI18n: Record<string, string>;
  prompt: string;
};

export const usePrompts = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptSummary | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { loading, data, refetch } = useQuery(GET_TENANT_PROMPT_OVERRIDES_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: tenantConfigsData, loading: tenantConfigsLoading } = useQuery(
    GET_TENANT_COMMAND_CONFIGS_FOR_PROMPTS_QUERY,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  const [doUpsert, { loading: upsertLoading }] = useMutation(UPSERT_TENANT_PROMPT_OVERRIDE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const commandOptions: CommandOption[] = (tenantConfigsData?.tenantCommandConfigs ?? []).map((c) => ({
    value: c.id,
    label: c.commandName,
  }));

  const commandNameById = new Map(commandOptions.map((c) => [c.value, c.label]));

  const prompts: PromptSummary[] = (data?.tenantPromptOverrides ?? []).map((o) => ({
    id: o.id,
    commandId: o.commandId ?? undefined,
    commandName: o.commandId ? (commandNameById.get(o.commandId) ?? o.commandId) : undefined,
    userType: o.userType,
    descriptionI18n: o.descriptionI18nJson ? (JSON.parse(o.descriptionI18nJson) as Record<string, string>) : undefined,
    prompt: o.prompt,
  }));

  const openModal = (prompt: PromptSummary) => setSelectedPrompt(prompt);
  const closeModal = () => setSelectedPrompt(null);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const onCreatePrompt = async (input: PromptOverrideForm) => {
    await doUpsert({
      variables: {
        input: {
          commandId: input.commandId || undefined,
          userType: input.userType,
          descriptionI18nJson:
            Object.keys(input.descriptionI18n).length > 0 ? JSON.stringify(input.descriptionI18n) : undefined,
          prompt: input.prompt,
        },
      },
    });
  };

  const onUpdatePrompt = async (input: PromptOverrideForm) => {
    await doUpsert({
      variables: {
        input: {
          commandId: input.commandId || undefined,
          userType: input.userType,
          descriptionI18nJson:
            Object.keys(input.descriptionI18n).length > 0 ? JSON.stringify(input.descriptionI18n) : undefined,
          prompt: input.prompt,
        },
      },
    });
  };

  return {
    prompts,
    isLoading: loading || tenantConfigsLoading,
    commandOptions,
    selectedPrompt,
    openModal,
    closeModal,
    onUpdatePrompt,
    isUpdatingPrompt: upsertLoading,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    onCreatePrompt,
    isCreatingPrompt: upsertLoading,
  };
};
