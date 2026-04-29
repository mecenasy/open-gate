import { assign, fromPromise, setup } from 'xstate';
import { DEFAULT_FEATURES, DEFAULT_PHONE_STRATEGY } from './constants';
import type {
  ContactDraft,
  CustomCommandDraft,
  PhoneStrategyDraft,
  PlatformDraft,
  TenantFeaturesDraft,
  WizardState,
  WizardStepKey,
} from './interfaces';

/**
 * Outcome the submit actor returns to the machine. tenantId is set when
 * the create-tenant call succeeded — even with partialFailures the
 * tenant still exists, so the wizard transitions to `done`. Only a
 * top-level error (createTenant or switchTenant rejection) results in
 * `tenantId === null` and routes to the catastrophic-failure state.
 */
export interface SubmitWizardOutcome {
  tenantId: string | null;
  partialFailures: PartialFailure[];
  error: string | null;
}

export interface SubmitWizardInput {
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

/** Phone-procurement domain types, surfaced by the picker substate. */
export interface AvailablePhoneNumber {
  phoneE164: string;
  capabilities: { sms: boolean; mms: boolean; voice: boolean };
  region?: string | null;
  locality?: string | null;
}

export interface ListAvailableInput {
  country: string;
  limit: number;
}

export interface PurchaseInput {
  country: string;
  phoneE164: string;
}

export interface PurchaseResult {
  pendingId: string;
  phoneE164: string;
}

/**
 * Caller-supplied bridge between the machine and Apollo mutations —
 * keeps the machine module test-friendly and free of GraphQL imports.
 * Same pattern as signalOnboardingMachine.
 */
export interface TenantWizardDeps {
  submit: (input: SubmitWizardInput) => Promise<SubmitWizardOutcome>;
  listAvailableNumbers: (input: ListAvailableInput) => Promise<AvailablePhoneNumber[]>;
  purchasePhoneNumber: (input: PurchaseInput) => Promise<PurchaseResult>;
  releasePendingPurchase: (pendingId: string) => Promise<void>;
}

export interface TenantWizardContext {
  slug: string;
  name: string;
  features: TenantFeaturesDraft;
  phoneStrategy: PhoneStrategyDraft;
  platforms: PlatformDraft[];
  customCommands: CustomCommandDraft[];
  contacts: ContactDraft[];
  // Submit-time outcomes — surface in the view independent of which
  // state the machine is in (partial failures stick to `done` so the
  // user can read them after the wizard transitions).
  tenantId: string | null;
  partialFailures: PartialFailure[];
  error: string | null;
  // Phone picker substate data — populated by the listAvailable /
  // purchase actors so the view layer is a pure render of context.
  pickerNumbers: AvailablePhoneNumber[];
  pickerSelected: string | null;
  pickerError: string | null;
}

export type TenantWizardEvent =
  | { type: 'BASICS_NEXT'; slug: string; name: string }
  | { type: 'FEATURES_BACK'; features: TenantFeaturesDraft }
  | { type: 'FEATURES_NEXT'; features: TenantFeaturesDraft }
  | { type: 'PHONE_STRATEGY_BACK'; phoneStrategy: PhoneStrategyDraft }
  | { type: 'PHONE_STRATEGY_NEXT'; phoneStrategy: PhoneStrategyDraft }
  | { type: 'PHONE_PICKER_BACK' }
  | { type: 'PHONE_PICKER_NEXT' }
  | { type: 'PHONE_PICKER_REFRESH' }
  | { type: 'PHONE_PICKER_SELECT'; phoneE164: string }
  | { type: 'PHONE_PICKER_BUY' }
  | { type: 'PHONE_PICKER_CANCEL_PURCHASE' }
  | { type: 'PLATFORMS_BACK'; platforms: PlatformDraft[] }
  | { type: 'PLATFORMS_NEXT'; platforms: PlatformDraft[] }
  | { type: 'COMMANDS_BACK'; customCommands: CustomCommandDraft[] }
  | { type: 'COMMANDS_NEXT'; customCommands: CustomCommandDraft[] }
  | { type: 'CONTACTS_BACK'; contacts: ContactDraft[] }
  | { type: 'CONTACTS_FINISH'; contacts: ContactDraft[] }
  | { type: 'RESUME_DRAFT'; draft: WizardState }
  | { type: 'START_OVER' };

const PICKER_COUNTRY = 'PL';
const PICKER_LIMIT = 10;

const defaultContext = (): TenantWizardContext => ({
  slug: '',
  name: '',
  features: DEFAULT_FEATURES,
  phoneStrategy: DEFAULT_PHONE_STRATEGY,
  platforms: [],
  customCommands: [],
  contacts: [],
  tenantId: null,
  partialFailures: [],
  error: null,
  pickerNumbers: [],
  pickerSelected: null,
  pickerError: null,
});

const draftMatchesStep = (event: TenantWizardEvent, step: WizardStepKey): boolean =>
  event.type === 'RESUME_DRAFT' && event.draft.step === step;

const hasPickerPurchase = (ctx: TenantWizardContext): boolean =>
  !!ctx.phoneStrategy.purchasedPhoneE164 && !!ctx.phoneStrategy.pendingPurchaseId;

export const tenantWizardMachine = (deps: TenantWizardDeps) =>
  setup({
    types: {
      context: {} as TenantWizardContext,
      events: {} as TenantWizardEvent,
    },
    actors: {
      submitWizard: fromPromise<SubmitWizardOutcome, SubmitWizardInput>(({ input }) => deps.submit(input)),
      listAvailable: fromPromise<AvailablePhoneNumber[], ListAvailableInput>(({ input }) =>
        deps.listAvailableNumbers(input),
      ),
      buyPhone: fromPromise<PurchaseResult, PurchaseInput>(({ input }) => deps.purchasePhoneNumber(input)),
      releasePhone: fromPromise<void, string>(({ input }) => deps.releasePendingPurchase(input)),
    },
    guards: {
      isManagedFlow: ({ context }) => context.phoneStrategy.mode === 'managed',
      hasPurchase: ({ context }) => hasPickerPurchase(context),
      hasSelection: ({ context }) => !!context.pickerSelected,
      resumesAtBasics: ({ event }) => draftMatchesStep(event, 'basics'),
      resumesAtFeatures: ({ event }) => draftMatchesStep(event, 'features'),
      resumesAtPhoneStrategy: ({ event }) => draftMatchesStep(event, 'phoneStrategy'),
      resumesAtPhonePicker: ({ event }) => draftMatchesStep(event, 'phonePicker'),
      resumesAtPlatforms: ({ event }) => draftMatchesStep(event, 'platforms'),
      resumesAtCommands: ({ event }) => draftMatchesStep(event, 'commands'),
      resumesAtContacts: ({ event }) => draftMatchesStep(event, 'contacts'),
    },
    actions: {
      // Per-step writes — the corresponding event always carries the
      // current draft for that step, so we capture it on every Back/Next.
      // Keeps the persisted context fresh even if the user clicks Back
      // without first hitting Save somewhere.
      storeBasics: assign(({ event }) => (event.type === 'BASICS_NEXT' ? { slug: event.slug, name: event.name } : {})),
      storeFeatures: assign(({ event }) => {
        if (event.type === 'FEATURES_BACK' || event.type === 'FEATURES_NEXT') {
          return { features: event.features };
        }
        return {};
      }),
      storePhoneStrategy: assign(({ event }) => {
        if (event.type === 'PHONE_STRATEGY_BACK' || event.type === 'PHONE_STRATEGY_NEXT') {
          return { phoneStrategy: event.phoneStrategy };
        }
        return {};
      }),
      storePlatforms: assign(({ event }) => {
        if (event.type === 'PLATFORMS_BACK' || event.type === 'PLATFORMS_NEXT') {
          return { platforms: event.platforms };
        }
        return {};
      }),
      storeCommands: assign(({ event }) => {
        if (event.type === 'COMMANDS_BACK' || event.type === 'COMMANDS_NEXT') {
          return { customCommands: event.customCommands };
        }
        return {};
      }),
      storeContacts: assign(({ event }) => {
        if (event.type === 'CONTACTS_BACK' || event.type === 'CONTACTS_FINISH') {
          return { contacts: event.contacts };
        }
        return {};
      }),
      storePickerNumbers: assign(({ event }) => {
        const out = (event as unknown as { output?: AvailablePhoneNumber[] }).output;
        return { pickerNumbers: out ?? [], pickerError: null };
      }),
      storePickerListError: assign(({ event }) => {
        const err = (event as unknown as { error?: unknown }).error;
        return {
          pickerNumbers: [],
          pickerError: err instanceof Error ? err.message : 'Failed to load numbers',
        };
      }),
      storePickerSelection: assign(({ event }) => {
        if (event.type !== 'PHONE_PICKER_SELECT') return {};
        return { pickerSelected: event.phoneE164, pickerError: null };
      }),
      storePurchaseSuccess: assign(({ context, event }) => {
        const out = (event as unknown as { output?: PurchaseResult }).output;
        if (!out) return {};
        return {
          phoneStrategy: {
            ...context.phoneStrategy,
            mode: 'managed' as const,
            purchasedPhoneE164: out.phoneE164,
            pendingPurchaseId: out.pendingId,
          },
          pickerError: null,
        };
      }),
      storePurchaseError: assign(({ event }) => {
        const err = (event as unknown as { error?: unknown }).error;
        return { pickerError: err instanceof Error ? err.message : 'Purchase failed' };
      }),
      clearPurchase: assign(({ context }) => ({
        phoneStrategy: {
          ...context.phoneStrategy,
          purchasedPhoneE164: undefined,
          pendingPurchaseId: undefined,
        },
        pickerSelected: null,
        pickerError: null,
      })),
      hydrateFromDraft: assign(({ event }) => {
        if (event.type !== 'RESUME_DRAFT') return {};
        const d = event.draft;
        return {
          slug: d.slug,
          name: d.name,
          features: d.features,
          phoneStrategy: d.phoneStrategy,
          platforms: d.platforms,
          customCommands: d.customCommands,
          contacts: d.contacts,
          partialFailures: [],
          error: null,
          pickerNumbers: [],
          pickerSelected: null,
          pickerError: null,
        };
      }),
      storeOutcome: assign(({ event }) => {
        // assign within onDone receives the actor output as event.output.
        const out = (event as unknown as { output?: SubmitWizardOutcome }).output;
        if (!out) return {};
        return {
          tenantId: out.tenantId,
          partialFailures: out.partialFailures,
          error: out.error,
        };
      }),
      storeSubmitException: assign(({ event }) => {
        const err = (event as unknown as { error?: unknown }).error;
        return {
          tenantId: null,
          error: err instanceof Error ? err.message : String(err ?? 'Unknown error'),
        };
      }),
    },
  }).createMachine({
    id: 'tenantWizard',
    initial: 'basics',
    context: defaultContext(),
    // Resume can fire from any step — defined here so we don't repeat the
    // seven targeted transitions inside every state node. Each guard
    // matches one possible draft.step value; falls through silently if
    // the draft has an unrecognised step name (defensive).
    on: {
      RESUME_DRAFT: [
        { guard: 'resumesAtBasics', target: '.basics', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtFeatures', target: '.features', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtPhoneStrategy', target: '.phoneStrategy', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtPhonePicker', target: '.phonePicker', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtPlatforms', target: '.platforms', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtCommands', target: '.commands', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtContacts', target: '.contacts', actions: 'hydrateFromDraft' },
      ],
      START_OVER: { target: '.basics', actions: assign(() => defaultContext()) },
    },
    states: {
      basics: {
        on: {
          BASICS_NEXT: { target: 'features', actions: 'storeBasics' },
        },
      },
      features: {
        on: {
          FEATURES_BACK: { target: 'basics', actions: 'storeFeatures' },
          FEATURES_NEXT: { target: 'phoneStrategy', actions: 'storeFeatures' },
        },
      },
      phoneStrategy: {
        on: {
          PHONE_STRATEGY_BACK: { target: 'features', actions: 'storePhoneStrategy' },
          PHONE_STRATEGY_NEXT: [
            // Picker step is managed-only; self users skip straight to
            // platforms where they'll paste their own Twilio creds.
            { guard: 'isManagedFlow', target: 'phonePicker', actions: 'storePhoneStrategy' },
            { target: 'platforms', actions: 'storePhoneStrategy' },
          ],
        },
      },
      // Phone picker is a parent state with substates driving the
      // load → idle → purchase / cancel cycle. Navigation events
      // (PHONE_PICKER_BACK / NEXT) live on the parent so they fire
      // regardless of which substate the user is in (e.g. you can hit
      // Back even while loading; cancelling-mid-buy is intentionally
      // disallowed because the operator might have already charged us).
      phonePicker: {
        initial: 'evaluate',
        on: {
          PHONE_PICKER_BACK: { target: 'phoneStrategy' },
          PHONE_PICKER_NEXT: { guard: 'hasPurchase', target: 'platforms' },
        },
        states: {
          evaluate: {
            // Re-entry path (e.g. coming back from platforms with a
            // purchase already on the strategy) routes straight to the
            // purchased panel; first entry routes to loading.
            always: [{ guard: 'hasPurchase', target: 'purchased' }, { target: 'loading' }],
          },
          loading: {
            invoke: {
              src: 'listAvailable',
              input: () => ({ country: PICKER_COUNTRY, limit: PICKER_LIMIT }),
              onDone: { target: 'idle', actions: 'storePickerNumbers' },
              onError: { target: 'idle', actions: 'storePickerListError' },
            },
          },
          idle: {
            on: {
              PHONE_PICKER_REFRESH: 'loading',
              PHONE_PICKER_SELECT: { actions: 'storePickerSelection' },
              PHONE_PICKER_BUY: { guard: 'hasSelection', target: 'purchasing' },
            },
          },
          purchasing: {
            invoke: {
              src: 'buyPhone',
              input: ({ context }) => ({
                country: PICKER_COUNTRY,
                phoneE164: context.pickerSelected ?? '',
              }),
              onDone: { target: 'purchased', actions: 'storePurchaseSuccess' },
              onError: { target: 'idle', actions: 'storePurchaseError' },
            },
          },
          purchased: {
            on: {
              PHONE_PICKER_CANCEL_PURCHASE: 'releasing',
            },
          },
          releasing: {
            invoke: {
              src: 'releasePhone',
              input: ({ context }) => context.phoneStrategy.pendingPurchaseId ?? '',
              // Always clear the local purchase on completion (success or
              // failure): if release failed, the cleanup cron will pick
              // it up after 24h and we don't want the user stuck on a
              // panel they can't escape.
              onDone: { target: 'loading', actions: 'clearPurchase' },
              onError: { target: 'loading', actions: 'clearPurchase' },
            },
          },
        },
      },
      platforms: {
        on: {
          PLATFORMS_BACK: [
            // Symmetric with the forward transition: managed flow rewinds
            // through the picker, self flow skips it.
            { guard: 'isManagedFlow', target: 'phonePicker', actions: 'storePlatforms' },
            { target: 'phoneStrategy', actions: 'storePlatforms' },
          ],
          PLATFORMS_NEXT: { target: 'commands', actions: 'storePlatforms' },
        },
      },
      commands: {
        on: {
          COMMANDS_BACK: { target: 'platforms', actions: 'storeCommands' },
          COMMANDS_NEXT: { target: 'contacts', actions: 'storeCommands' },
        },
      },
      contacts: {
        on: {
          CONTACTS_BACK: { target: 'commands', actions: 'storeContacts' },
          CONTACTS_FINISH: { target: 'submitting', actions: 'storeContacts' },
        },
      },
      submitting: {
        invoke: {
          src: 'submitWizard',
          input: ({ context }) => ({
            slug: context.slug,
            features: context.features,
            phoneStrategy: context.phoneStrategy,
            platforms: context.platforms,
            customCommands: context.customCommands,
            contacts: context.contacts,
          }),
          // tenantId === null in onDone means createTenant or switchTenant
          // rejected — surface the captured `error` text on the contacts
          // step so the user can fix and retry without losing draft data.
          // Partial failures (features/platforms/etc.) stick on `done` so
          // they read like a post-create receipt rather than blockers.
          onDone: [
            {
              guard: ({ event }) => (event.output as SubmitWizardOutcome).tenantId !== null,
              target: 'done',
              actions: 'storeOutcome',
            },
            { target: 'contacts', actions: 'storeOutcome' },
          ],
          onError: { target: 'contacts', actions: 'storeSubmitException' },
        },
      },
      done: { type: 'final' },
    },
  });

export type TenantWizardMachine = ReturnType<typeof tenantWizardMachine>;
