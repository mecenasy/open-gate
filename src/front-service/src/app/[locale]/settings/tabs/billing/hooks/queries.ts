import { graphql } from '@/app/gql';

export const GET_BILLING_DATA_QUERY = graphql(`
  query GetBillingData {
    mySubscription {
      id
      status
      startedAt
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
    myUsage {
      billingUserId
      tenants
      perTenant {
        tenantId
        staff
        platforms
        contacts
        customCommands
      }
    }
    subscriptionHistory {
      id
      oldPlanId
      newPlanId
      kind
      initiatedAt
    }
  }
`);

export const PREVIEW_PLAN_CHANGE_QUERY = graphql(`
  query PreviewPlanChange($newPlanId: String!) {
    previewPlanChange(newPlanId: $newPlanId) {
      kind
      deltaPriceCents
      newPlan {
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
      currentPlan {
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
      violations {
        kind
        tenantId
        current
        max
      }
    }
  }
`);

export const CHANGE_PLAN_MUTATION = graphql(`
  mutation ChangePlan($input: SelectSubscriptionInput!) {
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

export const CANCEL_SUBSCRIPTION_MUTATION = graphql(`
  mutation CancelSubscription {
    cancelSubscription
  }
`);
