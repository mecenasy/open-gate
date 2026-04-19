'use client';

import { useMutation } from '@apollo/client/react';
import type { CommandConfigSummary, CommandUpsertInput } from '../interfaces';
import { UPSERT_TENANT_COMMAND_CONFIG_MUTATION } from './queries';

export const useCommandUpsert = () => {
  const [doUpsert, { loading }] = useMutation(UPSERT_TENANT_COMMAND_CONFIG_MUTATION, {
    refetchQueries: ['GetTenantCommandConfigs'],
  });

  const upsertCommand = async (input: CommandUpsertInput) => {
    await doUpsert({ variables: { input } });
  };

  const toggleActive = async (config: CommandConfigSummary, active: boolean) => {
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

  return { upsertCommand, toggleActive, isSaving: loading };
};
