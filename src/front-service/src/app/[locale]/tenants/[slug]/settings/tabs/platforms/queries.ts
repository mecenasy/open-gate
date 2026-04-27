import { graphql } from '@/app/gql';

export const TENANT_PLATFORM_CREDENTIALS_QUERY = graphql(`
  query TenantPlatformCredentials {
    tenantPlatformCredentials {
      platform
      configJson
      isDefault
    }
  }
`);
