import { graphql } from '@/app/gql';

export const GET_TENANT_PROMPT_OVERRIDES_QUERY = graphql(`
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

export const GET_TENANT_COMMAND_CONFIGS_FOR_PROMPTS_QUERY = graphql(`
  query GetTenantCommandConfigsForPrompts {
    tenantCommandConfigs {
      id
      commandName
    }
  }
`);

export const UPSERT_TENANT_PROMPT_OVERRIDE_MUTATION = graphql(`
  mutation UpsertTenantPromptOverride($input: UpsertTenantPromptOverrideInput!) {
    upsertTenantPromptOverride(input: $input) {
      status
      message
    }
  }
`);
