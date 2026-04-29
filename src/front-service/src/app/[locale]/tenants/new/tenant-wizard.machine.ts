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

/**
 * Caller-supplied bridge between the machine and Apollo mutations —
 * keeps the machine module test-friendly and free of GraphQL imports.
 * Phone-procurement actors live in their own machine (phoneProcurementMachine);
 * this top-level wizard only owns the submit chain.
 */
export interface TenantWizardDeps {
  submit: (input: SubmitWizardInput) => Promise<SubmitWizardOutcome>;
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
}

export type TenantWizardEvent =
  | { type: 'BASICS_NEXT'; slug: string; name: string }
  | { type: 'FEATURES_BACK'; features: TenantFeaturesDraft }
  | { type: 'FEATURES_NEXT'; features: TenantFeaturesDraft }
  | { type: 'PHONE_ACQUISITION_BACK' }
  | { type: 'PHONE_ACQUISITION_DONE'; phoneStrategy: PhoneStrategyDraft }
  | { type: 'PLATFORMS_BACK'; platforms: PlatformDraft[] }
  | { type: 'PLATFORMS_NEXT'; platforms: PlatformDraft[] }
  | { type: 'COMMANDS_BACK'; customCommands: CustomCommandDraft[] }
  | { type: 'COMMANDS_NEXT'; customCommands: CustomCommandDraft[] }
  | { type: 'CONTACTS_BACK'; contacts: ContactDraft[] }
  | { type: 'CONTACTS_FINISH'; contacts: ContactDraft[] }
  | { type: 'RESUME_DRAFT'; draft: WizardState }
  | { type: 'START_OVER' };

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
});

const draftMatchesStep = (event: TenantWizardEvent, step: WizardStepKey): boolean =>
  event.type === 'RESUME_DRAFT' && event.draft.step === step;

export const tenantWizardMachine = (deps: TenantWizardDeps) =>
  setup({
    types: {
      context: {} as TenantWizardContext,
      events: {} as TenantWizardEvent,
    },
    actors: {
      submitWizard: fromPromise<SubmitWizardOutcome, SubmitWizardInput>(({ input }) => deps.submit(input)),
    },
    guards: {
      // Self users skip the platforms-back rewind directly to phoneAcquisition;
      // managed users do the same — there's only one combined step now, so
      // the guard collapses to "any phone-strategy mode chose".
      hasPhoneStrategy: ({ context }) => context.phoneStrategy.mode !== null,
      resumesAtBasics: ({ event }) => draftMatchesStep(event, 'basics'),
      resumesAtFeatures: ({ event }) => draftMatchesStep(event, 'features'),
      resumesAtPhoneAcquisition: ({ event }) => draftMatchesStep(event, 'phoneAcquisition'),
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
      storePhoneAcquisitionOutcome: assign(({ event }) => {
        if (event.type !== 'PHONE_ACQUISITION_DONE') return {};
        return { phoneStrategy: event.phoneStrategy };
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
    // targeted transitions inside every state node. Each guard matches
    // one possible draft.step value; falls through silently if the draft
    // has an unrecognised step name (defensive — STORAGE_VERSION bump
    // already discards drafts from older schemas).
    on: {
      RESUME_DRAFT: [
        { guard: 'resumesAtBasics', target: '.basics', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtFeatures', target: '.features', actions: 'hydrateFromDraft' },
        { guard: 'resumesAtPhoneAcquisition', target: '.phoneAcquisition', actions: 'hydrateFromDraft' },
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
          FEATURES_NEXT: { target: 'phoneAcquisition', actions: 'storeFeatures' },
        },
      },
      // Combined strategy + picker step — the actual flow lives in
      // phoneProcurementMachine, which the React layer runs as a child
      // useMachine inside StepPhoneAcquisition. We only see two events:
      // BACK to features, and DONE with the final strategy.
      phoneAcquisition: {
        on: {
          PHONE_ACQUISITION_BACK: { target: 'features' },
          PHONE_ACQUISITION_DONE: { target: 'platforms', actions: 'storePhoneAcquisitionOutcome' },
        },
      },
      platforms: {
        on: {
          // No more managed/self routing split — both flows rewind to
          // the same combined acquisition step.
          PLATFORMS_BACK: { target: 'phoneAcquisition', actions: 'storePlatforms' },
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
