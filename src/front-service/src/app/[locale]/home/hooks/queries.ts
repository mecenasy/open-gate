import { graphql } from '@/app/gql';

export const GET_HOME_DATA_QUERY = graphql(`
  query GetHomeData {
    mySubscription {
      id
      status
      plan {
        id
        code
        name
        maxTenants
        maxPlatformsPerTenant
        maxContactsPerTenant
        maxStaffPerTenant
        maxCustomCommandsPerTenant
        priceCents
        currency
      }
    }
    subscriptionPlans {
      id
      code
      name
      maxTenants
      maxPlatformsPerTenant
      maxContactsPerTenant
      maxStaffPerTenant
      maxCustomCommandsPerTenant
      priceCents
      currency
      isActive
    }
    myTenants {
      id
      slug
      billingUserId
      isActive
    }
    tenantsIStaffAt {
      tenantId
      tenantSlug
      role
    }
  }
`);

export const SELECT_SUBSCRIPTION_MUTATION = graphql(`
  mutation SelectSubscription($input: SelectSubscriptionInput!) {
    selectSubscription(input: $input) {
      id
      status
      plan {
        id
        code
        name
      }
    }
  }
`);

export const SWITCH_TENANT_MUTATION = graphql(`
  mutation SwitchActiveTenant($tenantId: String!) {
    switchTenant(tenantId: $tenantId)
  }
`);
