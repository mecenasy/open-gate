'use client';

import { useEffect, useMemo } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useMachine } from '@xstate/react';
import {
  ADD_CONTACT_WIZARD_MUTATION,
  ADD_CUSTOM_COMMAND_WIZARD_MUTATION,
  ATTACH_PHONE_TO_TENANT_MUTATION,
  AVAILABLE_PHONE_NUMBERS_QUERY,
  CREATE_TENANT_MUTATION,
  PURCHASE_PHONE_NUMBER_MUTATION,
  RELEASE_PENDING_PURCHASE_MUTATION,
  SWITCH_TENANT_WIZARD_MUTATION,
  UPDATE_TENANT_FEATURES_WIZARD_MUTATION,
  UPSERT_PLATFORM_WIZARD_MUTATION,
} from './queries';
import {
  tenantWizardMachine,
  type AvailablePhoneNumber,
  type PartialFailure,
  type SubmitWizardInput,
  type SubmitWizardOutcome,
  type TenantWizardDeps,
} from '../tenant-wizard.machine';
import type { WizardState, WizardStepKey } from '../interfaces';

export type PickerStatus = 'loading' | 'idle' | 'purchasing' | 'purchased' | 'releasing';

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

interface PickerSlice {
  status: PickerStatus;
  numbers: AvailablePhoneNumber[];
  selected: string | null;
  error: string | null;
}

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
  /** Phone picker substate snapshot — picker view renders from this. */
  picker: PickerSlice;
  send: ReturnType<typeof useMachine<ReturnType<typeof tenantWizardMachine>>>[1];
}

/**
 * Wires the tenant wizard XState machine to Apollo mutations and queries.
 * Keeps the machine module test-friendly (deps are injected) and surfaces
 * a react-friendly shape for the view layer.
 *
 * Uses `apolloClient.query` for the phone-numbers list (via deps callback)
 * rather than a hook-driven useQuery, so the fetch is owned by the machine
 * actor — the picker view stays a pure render of context.
 */
export function useTenantWizard(): UseTenantWizardResult {
  const apolloClient = useApolloClient();
  const [doCreate] = useMutation(CREATE_TENANT_MUTATION, {
    refetchQueries: ['GetMyTenants', 'GetTenantsIStaffAt'],
  });
  const [doSwitch] = useMutation(SWITCH_TENANT_WIZARD_MUTATION);
  const [doAttachPhone] = useMutation(ATTACH_PHONE_TO_TENANT_MUTATION);
  const [doFeatures] = useMutation(UPDATE_TENANT_FEATURES_WIZARD_MUTATION);
  const [doPlatform] = useMutation(UPSERT_PLATFORM_WIZARD_MUTATION);
  const [doCustomCommand] = useMutation(ADD_CUSTOM_COMMAND_WIZARD_MUTATION);
  const [doContact] = useMutation(ADD_CONTACT_WIZARD_MUTATION);
  const [doPurchase] = useMutation(PURCHASE_PHONE_NUMBER_MUTATION);
  const [doRelease] = useMutation(RELEASE_PENDING_PURCHASE_MUTATION);

  const deps = useMemo<TenantWizardDeps>(
    () => ({
      submit: (input) =>
        runSubmit(input, { doCreate, doSwitch, doAttachPhone, doFeatures, doPlatform, doCustomCommand, doContact }),
      listAvailableNumbers: async ({ country, limit }) => {
        const res = await apolloClient.query({
          query: AVAILABLE_PHONE_NUMBERS_QUERY,
          variables: { input: { country, limit, type: 'mobile' } },
          fetchPolicy: 'network-only',
        });
        const list = (res.data?.availablePhoneNumbers ?? []) as AvailablePhoneNumber[];
        return list;
      },
      purchasePhoneNumber: async ({ country, phoneE164 }) => {
        const res = await doPurchase({ variables: { input: { country, phoneE164 } } });
        const entry = res.data?.purchasePhoneNumber;
        if (!entry) throw new Error('Purchase did not return a pending row.');
        return { pendingId: entry.id, phoneE164: entry.phoneE164 };
      },
      releasePendingPurchase: async (pendingId) => {
        await doRelease({ variables: { pendingId } });
      },
    }),
    [
      apolloClient,
      doCreate,
      doSwitch,
      doAttachPhone,
      doFeatures,
      doPlatform,
      doCustomCommand,
      doContact,
      doPurchase,
      doRelease,
    ],
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

  // Top-level state is either a step name (string) or the picker compound
  // state (object like `{ phonePicker: 'idle' }`). Normalize to a single
  // WizardStepKey so the view + persistence don't have to care about
  // substates.
  const stateValue = state.value;
  const step: WizardStepKey =
    typeof stateValue === 'string' ? (stateValue as WizardStepKey) : (Object.keys(stateValue)[0] as WizardStepKey);

  const pickerStatus: PickerStatus = state.matches({ phonePicker: 'loading' })
    ? 'loading'
    : state.matches({ phonePicker: 'purchasing' })
      ? 'purchasing'
      : state.matches({ phonePicker: 'purchased' })
        ? 'purchased'
        : state.matches({ phonePicker: 'releasing' })
          ? 'releasing'
          : 'idle';

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

  const picker: PickerSlice = {
    status: pickerStatus,
    numbers: state.context.pickerNumbers,
    selected: state.context.pickerSelected,
    error: state.context.pickerError,
  };

  return {
    step,
    wizardState,
    isSubmitting: state.matches('submitting'),
    isDone: state.matches('done'),
    error: state.context.error,
    partialFailures: state.context.partialFailures,
    tenantId: state.context.tenantId,
    picker,
    send,
  };
}
