'use client';

import { useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useMachine } from '@xstate/react';
import {
  ADD_CONTACT_WIZARD_MUTATION,
  ADD_CUSTOM_COMMAND_WIZARD_MUTATION,
  ATTACH_PHONE_TO_TENANT_MUTATION,
  CREATE_TENANT_MUTATION,
  SWITCH_TENANT_WIZARD_MUTATION,
  UPDATE_TENANT_FEATURES_WIZARD_MUTATION,
  UPSERT_PLATFORM_WIZARD_MUTATION,
} from './queries';
import {
  tenantWizardMachine,
  type PartialFailure,
  type SubmitWizardInput,
  type SubmitWizardOutcome,
  type TenantWizardDeps,
} from '../tenant-wizard.machine';
import type { WizardState, WizardStepKey } from '../interfaces';

/**
 * One submit chain shared by managed and self flows. Mirrors the order
 * the previous useCreateTenantWizard hook used:
 *   createTenant → switchTenant → attachPhone (managed only)
 *     → features → platforms → commands → contacts.
 *
 * Top-level rejections (createTenant / switchTenant) abort with a string
 * error and `tenantId: null`. Per-step failures past those two are
 * collected as partial failures so the wizard can surface a partial
 * receipt without losing the tenant.
 *
 * Mutation handlers are typed loosely as `Mutate` because the seven
 * mutations have seven different generated input types — the strict
 * shape is enforced by the inline `variables` payload, not by the
 * function signature here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mutate = (opts: { variables: any }) => Promise<{ data?: any }>;

interface SubmitDeps {
  doCreate: Mutate;
  doSwitch: Mutate;
  doAttachPhone: Mutate;
  doFeatures: Mutate;
  doPlatform: Mutate;
  doCustomCommand: Mutate;
  doContact: Mutate;
}

const runSubmit = async (input: SubmitWizardInput, m: SubmitDeps): Promise<SubmitWizardOutcome> => {
  const failures: PartialFailure[] = [];
  try {
    const createRes = await m.doCreate({
      variables: { input: { slug: input.slug.trim().toLowerCase() } },
    });
    const tenantId = (createRes.data as { createTenant?: { id?: string } } | null | undefined)?.createTenant?.id;
    if (!tenantId) throw new Error('Tenant not created');

    await m.doSwitch({ variables: { tenantId } });

    if (input.phoneStrategy.mode === 'managed' && input.phoneStrategy.pendingPurchaseId) {
      try {
        await m.doAttachPhone({
          variables: {
            input: { pendingId: input.phoneStrategy.pendingPurchaseId, tenantId },
          },
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
      await m.doFeatures({ variables: { input: { tenantId, ...input.features } } });
    } catch (err) {
      failures.push({
        step: 'features',
        identifier: 'features',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    for (const p of input.platforms) {
      try {
        await m.doPlatform({
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
        await m.doCustomCommand({
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
        await m.doContact({
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

    return { tenantId, partialFailures: failures, error: null };
  } catch (err) {
    return {
      tenantId: null,
      partialFailures: failures,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};

interface UseTenantWizardResult {
  /** Current step of the machine, narrowed to the wizard's vocabulary. */
  step: WizardStepKey;
  /** Current wizard state suitable for persistence — derived from machine context. */
  wizardState: WizardState;
  isSubmitting: boolean;
  isDone: boolean;
  /** Top-level submit error (createTenant/switchTenant rejection); shown above contacts step. */
  error: string | null;
  /** Per-step failures from the submit chain — present even after `done` so the user can read them. */
  partialFailures: PartialFailure[];
  /** Tenant ID after successful create — set in `done`. */
  tenantId: string | null;
  send: ReturnType<typeof useMachine<ReturnType<typeof tenantWizardMachine>>>[1];
}

/**
 * Wires the tenant wizard XState machine to Apollo mutations. Keeps the
 * machine module test-friendly (deps are injected) and surfaces a
 * react-friendly shape for the view layer.
 */
export function useTenantWizard(): UseTenantWizardResult {
  const [doCreate] = useMutation(CREATE_TENANT_MUTATION, {
    refetchQueries: ['GetMyTenants', 'GetTenantsIStaffAt'],
  });
  const [doSwitch] = useMutation(SWITCH_TENANT_WIZARD_MUTATION);
  const [doAttachPhone] = useMutation(ATTACH_PHONE_TO_TENANT_MUTATION);
  const [doFeatures] = useMutation(UPDATE_TENANT_FEATURES_WIZARD_MUTATION);
  const [doPlatform] = useMutation(UPSERT_PLATFORM_WIZARD_MUTATION);
  const [doCustomCommand] = useMutation(ADD_CUSTOM_COMMAND_WIZARD_MUTATION);
  const [doContact] = useMutation(ADD_CONTACT_WIZARD_MUTATION);

  const deps = useMemo<TenantWizardDeps>(
    () => ({
      submit: (input) =>
        runSubmit(input, { doCreate, doSwitch, doAttachPhone, doFeatures, doPlatform, doCustomCommand, doContact }),
    }),
    [doCreate, doSwitch, doAttachPhone, doFeatures, doPlatform, doCustomCommand, doContact],
  );

  const machine = useMemo(() => tenantWizardMachine(deps), [deps]);
  const [state, send] = useMachine(machine);

  // Surface a console warning on top-level submit failure so devs notice
  // it during local repro — the UI still shows it via state.context.error
  // but a logged stack speeds up triage.
  useEffect(() => {
    if (state.context.error && state.matches('contacts')) {
      // eslint-disable-next-line no-console
      console.warn('TenantWizard submit failed:', state.context.error);
    }
  }, [state]);

  const step = state.value as WizardStepKey;
  const wizardState: WizardState = {
    step,
    slug: state.context.slug,
    name: state.context.name,
    features: state.context.features,
    phoneStrategy: state.context.phoneStrategy,
    platforms: state.context.platforms,
    customCommands: state.context.customCommands,
    contacts: state.context.contacts,
  };

  return {
    step,
    wizardState,
    isSubmitting: state.matches('submitting'),
    isDone: state.matches('done'),
    error: state.context.error,
    partialFailures: state.context.partialFailures,
    tenantId: state.context.tenantId,
    send,
  };
}
