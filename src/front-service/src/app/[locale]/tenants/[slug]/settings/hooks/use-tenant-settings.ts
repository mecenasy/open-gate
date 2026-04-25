'use client';

import { useQuery } from '@apollo/client/react';
import { useHomeData } from '@/app/[locale]/home/hooks/use-home-data';
import { TENANT_SETTINGS_QUERY } from './queries';
import type {
  TenantBrandingForm,
  TenantCommandsForm,
  TenantComplianceForm,
  TenantFeaturesForm,
  TenantMessagingForm,
  TenantStaffEntry,
} from '../interfaces';

interface TenantSummary {
  id: string;
  slug: string;
  isActive: boolean;
  billingUserId: string | null;
}

interface UseTenantSettingsResult {
  tenant: TenantSummary | null;
  isMember: boolean;
  branding: TenantBrandingForm | null;
  features: TenantFeaturesForm | null;
  messaging: TenantMessagingForm | null;
  commands: TenantCommandsForm | null;
  compliance: TenantComplianceForm | null;
  staff: TenantStaffEntry[];
  isLoading: boolean;
  error: unknown;
}

export const useTenantSettings = (slug: string): UseTenantSettingsResult => {
  const { myTenants, staffMemberships, isLoading: homeLoading } = useHomeData();

  const owned = myTenants.find((t) => t.slug === slug);
  const staffed = staffMemberships.find((m) => m.tenantSlug === slug);

  const tenant: TenantSummary | null = owned
    ? { id: owned.id, slug: owned.slug, isActive: owned.isActive, billingUserId: owned.billingUserId ?? null }
    : staffed
      ? { id: staffed.tenantId, slug: staffed.tenantSlug, isActive: true, billingUserId: null }
      : null;

  const { data, loading, error } = useQuery(TENANT_SETTINGS_QUERY, {
    variables: { tenantId: tenant?.id ?? '' },
    skip: !tenant,
    fetchPolicy: 'cache-and-network',
  });

  const customization = data?.tenantCustomization;

  return {
    tenant,
    isMember: Boolean(tenant),
    branding: customization
      ? {
          logoUrl: customization.branding.logoUrl ?? '',
          primaryColor: customization.branding.primaryColor ?? '',
          secondaryColor: customization.branding.secondaryColor ?? '',
          fontSize: (customization.branding.fontSize as TenantBrandingForm['fontSize']) ?? '',
        }
      : null,
    features: customization
      ? {
          enableSignal: customization.features.enableSignal,
          enableWhatsApp: customization.features.enableWhatsApp,
          enableMessenger: customization.features.enableMessenger,
          enableGate: customization.features.enableGate,
          enablePayment: customization.features.enablePayment,
          enableCommandScheduling: customization.features.enableCommandScheduling,
          enableAnalytics: customization.features.enableAnalytics,
          enableAudioRecognition: customization.features.enableAudioRecognition,
        }
      : null,
    messaging: customization
      ? {
          defaultSmsProvider: customization.messaging.defaultSmsProvider as TenantMessagingForm['defaultSmsProvider'],
          priorityChannels: customization.messaging.priorityChannels,
          rateLimitPerMinute: customization.messaging.rateLimitPerMinute,
        }
      : null,
    commands: customization
      ? {
          timeout: customization.commands.timeout,
          maxRetries: customization.commands.maxRetries,
          processingDelay: customization.commands.processingDelay,
          customPromptLibraryEnabled: customization.commands.customPromptLibraryEnabled,
        }
      : null,
    compliance: customization
      ? {
          dataResidency: customization.compliance.dataResidency as TenantComplianceForm['dataResidency'],
          encryptionEnabled: customization.compliance.encryptionEnabled,
          webhookUrl: customization.compliance.webhookUrl ?? '',
        }
      : null,
    staff: (data?.tenantStaff ?? []).map((s) => ({
      tenantId: s.tenantId,
      userId: s.userId,
      role: s.role,
    })),
    isLoading: homeLoading || loading,
    error,
  };
};
