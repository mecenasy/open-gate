import { graphql } from '@/app/gql';

export const GET_TENANT_COMMAND_CONFIGS_QUERY = graphql(`
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

export const UPSERT_TENANT_COMMAND_CONFIG_MUTATION = graphql(`
  mutation UpsertTenantCommandConfigMutation($input: UpsertTenantCommandConfigInput!) {
    upsertTenantCommandConfig(input: $input) {
      status
      message
    }
  }
`);

export const DELETE_TENANT_COMMAND_CONFIG_MUTATION = graphql(`
  mutation DeleteTenantCommandConfig($input: DeleteTenantCommandConfigInput!) {
    deleteTenantCommandConfig(input: $input) {
      status
      message
    }
  }
`);
