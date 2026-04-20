import { graphql } from '@/app/gql';

export const TENANT_SLUG_AVAILABLE_QUERY = graphql(`
  query TenantSlugAvailable($slug: String!) {
    tenantSlugAvailable(slug: $slug)
  }
`);

export const CREATE_TENANT_MUTATION = graphql(`
  mutation CreateTenantWizard($input: CreateTenantInput!) {
    createTenant(input: $input) {
      id
      slug
      schemaName
    }
  }
`);

export const SWITCH_TENANT_WIZARD_MUTATION = graphql(`
  mutation SwitchTenantWizard($tenantId: String!) {
    switchTenant(tenantId: $tenantId)
  }
`);

export const UPDATE_TENANT_FEATURES_WIZARD_MUTATION = graphql(`
  mutation UpdateTenantFeaturesWizard($input: UpdateTenantFeaturesInput!) {
    updateTenantFeatures(input: $input) {
      status
      message
    }
  }
`);

export const ADD_CONTACT_WIZARD_MUTATION = graphql(`
  mutation AddContactWizard($input: AddContactInput!) {
    addContact(input: $input) {
      id
    }
  }
`);
