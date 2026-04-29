import { assign, fromPromise, setup } from 'xstate';
import type { PhoneStrategyDraft, PhoneStrategyMode } from './interfaces';

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
 * Caller-supplied bridge between the procurement machine and Apollo.
 * Same dep-injection pattern as tenantWizardMachine — keeps this module
 * test-friendly and free of GraphQL imports.
 */
export interface PhoneProcurementDeps {
  listAvailableNumbers: (input: ListAvailableInput) => Promise<AvailablePhoneNumber[]>;
  purchasePhoneNumber: (input: PurchaseInput) => Promise<PurchaseResult>;
  releasePendingPurchase: (pendingId: string) => Promise<void>;
}

export interface PhoneProcurementContext {
  mode: PhoneStrategyMode | null;
  purchasedPhoneE164?: string;
  pendingPurchaseId?: string;
  numbers: AvailablePhoneNumber[];
  selected: string | null;
  error: string | null;
}

export type PhoneProcurementEvent =
  | { type: 'CHOOSE_MANAGED' }
  | { type: 'CHOOSE_SELF' }
  | { type: 'BACK_TO_CHOOSE' }
  | { type: 'REFRESH' }
  | { type: 'SELECT'; phoneE164: string }
  | { type: 'BUY' }
  | { type: 'CANCEL_PURCHASE' }
  | { type: 'CONFIRM' };

export interface PhoneProcurementOutput {
  mode: PhoneStrategyMode;
  purchasedPhoneE164?: string;
  pendingPurchaseId?: string;
}

export interface PhoneProcurementInput {
  /** Strategy already in the wizard context — drives the machine's initial state. */
  initialStrategy: PhoneStrategyDraft;
}

const PICKER_COUNTRY = 'PL';
const PICKER_LIMIT = 10;

/**
 * Owns the entire phone-acquisition flow: pick managed-or-self, list +
 * buy + release for managed, then emit the final strategy. Designed to
 * be `useMachine`'d at the step-component level rather than invoked from
 * the parent wizard — that keeps the deps closure local to React (Apollo
 * mutations are React-stable but only inside hooks) and keeps the parent
 * wizard machine thin.
 *
 * The parent wizard receives the final strategy through the
 * `onDone(strategy)` callback that the React wrapper fires when this
 * machine reaches its final state.
 *
 * Initial state evaluation routes the user back to where they left off
 * on remount/resume:
 *   - mode='self'   → `self` (just confirm)
 *   - mode='managed' with purchase → `managed.purchased`
 *   - mode='managed' without purchase → `managed.loading` (re-fetch list)
 *   - mode=null     → `chooseMode`
 */
export const phoneProcurementMachine = (deps: PhoneProcurementDeps) =>
  setup({
    types: {
      context: {} as PhoneProcurementContext,
      events: {} as PhoneProcurementEvent,
      input: {} as PhoneProcurementInput,
      output: {} as PhoneProcurementOutput,
    },
    actors: {
      listAvailable: fromPromise<AvailablePhoneNumber[], ListAvailableInput>(({ input }) =>
        deps.listAvailableNumbers(input),
      ),
      buyPhone: fromPromise<PurchaseResult, PurchaseInput>(({ input }) => deps.purchasePhoneNumber(input)),
      releasePhone: fromPromise<void, string>(({ input }) => deps.releasePendingPurchase(input)),
    },
    guards: {
      hasInitialPurchase: ({ context }) => !!context.purchasedPhoneE164 && !!context.pendingPurchaseId,
      hasSelection: ({ context }) => !!context.selected,
      isSelfInitial: ({ context }) => context.mode === 'self',
      isManagedInitial: ({ context }) => context.mode === 'managed',
    },
    actions: {
      storeNumbers: assign(({ event }) => {
        const out = (event as unknown as { output?: AvailablePhoneNumber[] }).output;
        return { numbers: out ?? [], error: null };
      }),
      storeListError: assign(({ event }) => {
        const err = (event as unknown as { error?: unknown }).error;
        return { numbers: [], error: err instanceof Error ? err.message : 'Failed to load numbers' };
      }),
      selectPhone: assign(({ event }) => {
        if (event.type !== 'SELECT') return {};
        return { selected: event.phoneE164, error: null };
      }),
      storePurchase: assign(({ event }) => {
        const out = (event as unknown as { output?: PurchaseResult }).output;
        if (!out) return {};
        return {
          purchasedPhoneE164: out.phoneE164,
          pendingPurchaseId: out.pendingId,
          error: null,
        };
      }),
      storePurchaseError: assign(({ event }) => {
        const err = (event as unknown as { error?: unknown }).error;
        return { error: err instanceof Error ? err.message : 'Purchase failed' };
      }),
      clearPurchase: assign(() => ({
        purchasedPhoneE164: undefined,
        pendingPurchaseId: undefined,
        selected: null,
        error: null,
      })),
      setManagedMode: assign(() => ({ mode: 'managed' as const })),
      setSelfMode: assign(() => ({ mode: 'self' as const })),
      // BACK_TO_CHOOSE wipes any in-flight picker / purchase state too:
      // flipping mode mid-flow shouldn't carry over a stale selection or
      // a number the user already paid for under the previous decision.
      clearAll: assign(() => ({
        mode: null,
        purchasedPhoneE164: undefined,
        pendingPurchaseId: undefined,
        numbers: [],
        selected: null,
        error: null,
      })),
    },
  }).createMachine({
    id: 'phoneProcurement',
    initial: 'evaluate',
    context: ({ input }) => ({
      mode: input.initialStrategy.mode,
      purchasedPhoneE164: input.initialStrategy.purchasedPhoneE164,
      pendingPurchaseId: input.initialStrategy.pendingPurchaseId,
      numbers: [],
      selected: null,
      error: null,
    }),
    output: ({ context }) => ({
      // Mode is non-null by the time we reach `done` — the final-state
      // transition is only fired from `self` or `managed.purchased`,
      // both of which set mode in their actions.
      mode: context.mode as PhoneStrategyMode,
      purchasedPhoneE164: context.purchasedPhoneE164,
      pendingPurchaseId: context.pendingPurchaseId,
    }),
    states: {
      evaluate: {
        always: [
          { guard: 'isSelfInitial', target: 'self' },
          { guard: 'isManagedInitial', target: 'managed' },
          { target: 'chooseMode' },
        ],
      },
      chooseMode: {
        on: {
          CHOOSE_MANAGED: { target: 'managed', actions: 'setManagedMode' },
          CHOOSE_SELF: { target: 'self', actions: 'setSelfMode' },
        },
      },
      self: {
        on: {
          BACK_TO_CHOOSE: { target: 'chooseMode', actions: 'clearAll' },
          CONFIRM: 'done',
        },
      },
      managed: {
        initial: 'evaluatePurchase',
        on: {
          BACK_TO_CHOOSE: { target: 'chooseMode', actions: 'clearAll' },
        },
        states: {
          evaluatePurchase: {
            // Re-entry after resume / back-from-platforms: jump straight
            // to the purchased panel if the strategy already carries a
            // pending row, else load fresh inventory.
            always: [{ guard: 'hasInitialPurchase', target: 'purchased' }, { target: 'loading' }],
          },
          loading: {
            invoke: {
              src: 'listAvailable',
              input: () => ({ country: PICKER_COUNTRY, limit: PICKER_LIMIT }),
              onDone: { target: 'idle', actions: 'storeNumbers' },
              onError: { target: 'idle', actions: 'storeListError' },
            },
          },
          idle: {
            on: {
              REFRESH: 'loading',
              SELECT: { actions: 'selectPhone' },
              BUY: { guard: 'hasSelection', target: 'purchasing' },
            },
          },
          purchasing: {
            invoke: {
              src: 'buyPhone',
              input: ({ context }) => ({
                country: PICKER_COUNTRY,
                phoneE164: context.selected ?? '',
              }),
              onDone: { target: 'purchased', actions: 'storePurchase' },
              onError: { target: 'idle', actions: 'storePurchaseError' },
            },
          },
          purchased: {
            on: {
              CANCEL_PURCHASE: 'releasing',
              CONFIRM: '#phoneProcurement.done',
            },
          },
          releasing: {
            // Always fall through to loading on either success or failure
            // — release errors will be retried by the cleanup cron after
            // 24h, and we don't want to strand the user on a panel they
            // can't escape.
            invoke: {
              src: 'releasePhone',
              input: ({ context }) => context.pendingPurchaseId ?? '',
              onDone: { target: 'loading', actions: 'clearPurchase' },
              onError: { target: 'loading', actions: 'clearPurchase' },
            },
          },
        },
      },
      done: { type: 'final' },
    },
  });

export type PhoneProcurementMachine = ReturnType<typeof phoneProcurementMachine>;
