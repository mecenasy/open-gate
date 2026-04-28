'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  ADD_CONTACT_WIZARD_MUTATION,
  ADD_CUSTOM_COMMAND_WIZARD_MUTATION,
  ATTACH_PHONE_TO_TENANT_MUTATION,
  CREATE_TENANT_MUTATION,
  SWITCH_TENANT_WIZARD_MUTATION,
  UPDATE_TENANT_FEATURES_WIZARD_MUTATION,
  UPSERT_PLATFORM_WIZARD_MUTATION,
} from './queries';
import type {
  ContactDraft,
  CustomCommandDraft,
  PhoneStrategyDraft,
  PlatformDraft,
  TenantFeaturesDraft,
} from '../interfaces';

interface SubmitInput {
  slug: string;
  features: TenantFeaturesDraft;
  phoneStrategy: PhoneStrategyDraft;
  platforms: PlatformDraft[];
  customCommands: CustomCommandDraft[];
  contacts: ContactDraft[];
}

export interface PartialFailure {
  step: 'features' | 'platforms' | 'commands' | 'contacts' | 'phone';
  identifier: string;
  message: string;
}

export const useCreateTenantWizard = () => {
  const [doCreate] = useMutation(CREATE_TENANT_MUTATION, {
    refetchQueries: ['GetMyTenants', 'GetTenantsIStaffAt'],
  });
  const [doSwitch] = useMutation(SWITCH_TENANT_WIZARD_MUTATION);
  const [doAttachPhone] = useMutation(ATTACH_PHONE_TO_TENANT_MUTATION);
  const [doFeatures] = useMutation(UPDATE_TENANT_FEATURES_WIZARD_MUTATION);
  const [doPlatform] = useMutation(UPSERT_PLATFORM_WIZARD_MUTATION);
  const [doCustomCommand] = useMutation(ADD_CUSTOM_COMMAND_WIZARD_MUTATION);
  const [doContact] = useMutation(ADD_CONTACT_WIZARD_MUTATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialFailures, setPartialFailures] = useState<PartialFailure[]>([]);

  const submit = async (input: SubmitInput): Promise<string | null> => {
    setIsSubmitting(true);
    setError(null);
    setPartialFailures([]);
    const failures: PartialFailure[] = [];
    try {
      const createRes = await doCreate({
        variables: { input: { slug: input.slug.trim().toLowerCase() } },
      });
      const tenantId = createRes.data?.createTenant.id;
      if (!tenantId) throw new Error('Tenant not created');

      await doSwitch({ variables: { tenantId } });

      // Attach managed phone first — the SMS platform upsert below needs
      // the tenant_phone_numbers row to be in place so the resolver can
      // see the managed number when sending later. A failure here doesn't
      // block tenant creation but is surfaced as a high-visibility partial
      // failure: the user paid for a number we couldn't link, and the
      // cleanup cron would otherwise wait 24h before releasing it.
      if (input.phoneStrategy.mode === 'managed' && input.phoneStrategy.pendingPurchaseId) {
        try {
          await doAttachPhone({
            variables: { input: { pendingId: input.phoneStrategy.pendingPurchaseId, tenantId } },
          });
        } catch (err) {
          failures.push({
            step: 'phone',
            identifier: input.phoneStrategy.purchasedPhoneE164 ?? input.phoneStrategy.pendingPurchaseId,
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      try {
        await doFeatures({ variables: { input: { tenantId, ...input.features } } });
      } catch (err) {
        failures.push({
          step: 'features',
          identifier: 'features',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      for (const p of input.platforms) {
        try {
          await doPlatform({
            variables: { input: { tenantId, platform: p.platform, configJson: p.configJson } },
          });
        } catch (err) {
          failures.push({
            step: 'platforms',
            identifier: p.platform,
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      for (const c of input.customCommands) {
        try {
          await doCustomCommand({
            variables: { input: { tenantId, name: c.name, description: c.description } },
          });
        } catch (err) {
          failures.push({
            step: 'commands',
            identifier: c.name,
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      for (const c of input.contacts) {
        try {
          await doContact({
            variables: {
              input: {
                tenantId,
                name: c.name,
                surname: c.surname || null,
                email: c.email || null,
                phone: c.phone || null,
                accessLevel: c.accessLevel,
              },
            },
          });
        } catch (err) {
          failures.push({
            step: 'contacts',
            identifier: c.email || c.phone || c.name,
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      setPartialFailures(failures);
      return tenantId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error, partialFailures };
};
