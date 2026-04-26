'use client';

import { useQuery } from '@apollo/client/react';
import type { CommandOption, PromptSummary } from '../interfaces';
import { parseDescriptionI18n } from '../helpers';
import { GET_TENANT_COMMAND_CONFIGS_FOR_PROMPTS_QUERY, GET_TENANT_PROMPT_OVERRIDES_QUERY } from './queries';

export const usePromptsList = () => {
  const { loading: promptsLoading, data: promptsData } = useQuery(GET_TENANT_PROMPT_OVERRIDES_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const { loading: commandsLoading, data: commandsData } = useQuery(GET_TENANT_COMMAND_CONFIGS_FOR_PROMPTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const commandOptions: CommandOption[] = (commandsData?.tenantCommandConfigs ?? []).map((c) => ({
    value: c.id,
    label: c.commandName,
  }));

  const commandNameById = new Map(commandOptions.map((c) => [c.value, c.label]));

  const prompts: PromptSummary[] = (promptsData?.tenantPromptOverrides ?? []).map((o) => ({
    id: o.id,
    commandId: o.commandId ?? undefined,
    commandName: o.commandId ? (commandNameById.get(o.commandId) ?? o.commandId) : undefined,
    userType: o.userType,
    descriptionI18n: parseDescriptionI18n(o.descriptionI18nJson),
    prompt: o.prompt,
  }));

  return {
    prompts,
    commandOptions,
    isLoading: promptsLoading || commandsLoading,
  };
};
