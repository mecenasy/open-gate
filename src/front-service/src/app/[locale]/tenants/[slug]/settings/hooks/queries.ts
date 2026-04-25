import { graphql } from '@/app/gql';

export const TENANT_SETTINGS_QUERY = graphql(`
  query TenantSettings($tenantId: String!) {
    tenantCustomization(tenantId: $tenantId) {
      branding {
        logoUrl
        primaryColor
        secondaryColor
        fontSize
      }
      features {
        enableSignal
        enableWhatsApp
        enableMessenger
        enableGate
        enablePayment
        enableCommandScheduling
        enableAnalytics
        enableAudioRecognition
      }
      messaging {
        defaultSmsProvider
        priorityChannels
        rateLimitPerMinute
      }
      commands {
        timeout
        maxRetries
        processingDelay
        customPromptLibraryEnabled
      }
      compliance {
        dataResidency
        encryptionEnabled
        webhookUrl
      }
    }
    tenantStaff(tenantId: $tenantId) {
      tenantId
      userId
      role
    }
    myTenants {
      id
      slug
      schemaName
      isActive
      billingUserId
    }
    tenantsIStaffAt {
      tenantId
      tenantSlug
      role
    }
  }
`);

export const UPDATE_TENANT_BRANDING_MUTATION = graphql(`
  mutation UpdateTenantBranding($input: BrandingInput!) {
    updateTenantBranding(input: $input) {
      status
      message
    }
  }
`);

export const UPDATE_TENANT_FEATURES_MUTATION = graphql(`
  mutation UpdateTenantSettingsFeatures($input: UpdateTenantFeaturesInput!) {
    updateTenantFeatures(input: $input) {
      status
      message
    }
  }
`);

export const UPDATE_TENANT_MESSAGING_MUTATION = graphql(`
  mutation UpdateTenantMessaging($input: MessagingInput!) {
    updateTenantMessaging(input: $input) {
      status
      message
    }
  }
`);

export const UPDATE_TENANT_COMMANDS_MUTATION = graphql(`
  mutation UpdateTenantCommands($input: CommandsConfigInput!) {
    updateTenantCommands(input: $input) {
      status
      message
    }
  }
`);

export const UPDATE_TENANT_COMPLIANCE_MUTATION = graphql(`
  mutation UpdateTenantCompliance($input: ComplianceInput!) {
    updateTenantCompliance(input: $input) {
      status
      message
    }
  }
`);

export const SET_TENANT_ACTIVE_MUTATION = graphql(`
  mutation SetTenantActive($input: SetTenantActiveInput!) {
    setTenantActive(input: $input) {
      status
      message
    }
  }
`);

export const DELETE_TENANT_MUTATION = graphql(`
  mutation DeleteTenant($input: DeleteTenantInput!) {
    deleteTenant(input: $input) {
      status
      message
    }
  }
`);

export const ADD_TENANT_STAFF_MUTATION = graphql(`
  mutation AddTenantStaff($input: AddTenantStaffInput!) {
    addTenantStaff(input: $input) {
      status
      message
    }
  }
`);

export const REMOVE_TENANT_STAFF_MUTATION = graphql(`
  mutation RemoveTenantStaff($input: RemoveTenantStaffInput!) {
    removeTenantStaff(input: $input) {
      status
      message
    }
  }
`);

export const CHANGE_TENANT_STAFF_ROLE_MUTATION = graphql(`
  mutation ChangeTenantStaffRole($input: ChangeTenantStaffRoleInput!) {
    changeTenantStaffRole(input: $input) {
      status
      message
    }
  }
`);
