'use client';

import { useMutation } from '@apollo/client/react';
import type { PromptFormValues } from '../schemas/prompt.schema';
import { GET_TENANT_PROMPT_OVERRIDES_QUERY, UPSERT_TENANT_PROMPT_OVERRIDE_MUTATION } from './queries';

export const usePromptUpsert = () => {
  const [doUpsert, { loading }] = useMutation(UPSERT_TENANT_PROMPT_OVERRIDE_MUTATION, {
    refetchQueries: [{ query: GET_TENANT_PROMPT_OVERRIDES_QUERY }],
  });

  const upsertPrompt = async (values: PromptFormValues) => {
    const descriptionI18nJson =
      Object.keys(values.descriptionI18n).length > 0 ? JSON.stringify(values.descriptionI18n) : undefined;

    await doUpsert({
      variables: {
        input: {
          commandId: values.commandId || undefined,
          userType: values.userType,
          descriptionI18nJson,
          prompt: values.prompt,
        },
      },
    });
  };

  return { upsertPrompt, isSaving: loading };
};
