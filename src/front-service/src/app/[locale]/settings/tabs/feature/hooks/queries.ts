import { graphql } from '@/app/gql';

export const TENANT_FEATURES_QUERY = graphql(`
  query TenantFeaturesSettings {
    tenantFeatures {
      enableSignal
      enableWhatsApp
      enableMessenger
      enableGate
      enablePayment
      enableCommandScheduling
      enableAnalytics
      enableAudioRecognition
      maxUsersPerTenant
    }
  }
`);
