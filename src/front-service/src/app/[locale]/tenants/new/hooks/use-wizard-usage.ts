'use client';

import { useQuery } from '@apollo/client/react';
import { WIZARD_USAGE_QUERY } from './queries';

interface WizardUsage {
  tenants: number;
  maxTenants: number;
  maxPlatformsPerTenant: number;
  maxContactsPerTenant: number;
  maxCustomCommandsPerTenant: number;
  /** Phone procurement: numbers covered by the plan (0 disables managed flow). */
  phoneNumbersIncluded: number;
  /** Phone procurement: SMS quota covered by the subscription before overage. */
  messagesPerMonthIncluded: number;
  /** Phone procurement: cents charged per SMS over the included quota. */
  pricePerExtraMessageCents: number;
  /** Phone procurement: monthly operator cost included in the plan. */
  phoneMonthlyCostCents: number;
  /** Plan currency, used to format the phone procurement copy. */
  currency: string;
  isLoading: boolean;
}

export const useWizardUsage = (): WizardUsage => {
  const { data, loading } = useQuery(WIZARD_USAGE_QUERY, { fetchPolicy: 'cache-and-network' });
  const plan = data?.mySubscription?.plan;
  return {
    tenants: data?.myUsage?.tenants ?? 0,
    maxTenants: plan?.maxTenants ?? 0,
    maxPlatformsPerTenant: plan?.maxPlatformsPerTenant ?? 0,
    maxContactsPerTenant: plan?.maxContactsPerTenant ?? 0,
    maxCustomCommandsPerTenant: plan?.maxCustomCommandsPerTenant ?? 0,
    phoneNumbersIncluded: plan?.phoneNumbersIncluded ?? 0,
    messagesPerMonthIncluded: plan?.messagesPerMonthIncluded ?? 0,
    pricePerExtraMessageCents: plan?.pricePerExtraMessageCents ?? 0,
    phoneMonthlyCostCents: plan?.phoneMonthlyCostCents ?? 0,
    currency: plan?.currency ?? 'EUR',
    isLoading: loading,
  };
};
