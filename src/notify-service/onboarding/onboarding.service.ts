import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnboardingSessionStore } from './onboarding-session.store';
import { OnboardingProvider } from './platforms/onboarding-provider.interface';
import type { OnboardingSession, OnboardingStep } from './onboarding.types';

export const ONBOARDING_PROVIDERS = Symbol('ONBOARDING_PROVIDERS');

/**
 * Dispatcher: routes start/submit/cancel to the per-platform provider
 * and persists session state across calls. Knows *nothing* platform-specific —
 * adding a new platform means writing a provider, not touching this file.
 */
@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);
  private readonly providers = new Map<string, OnboardingProvider>();

  constructor(
    @Inject(ONBOARDING_PROVIDERS) providers: OnboardingProvider[],
    private readonly sessionStore: OnboardingSessionStore,
  ) {
    for (const p of providers) {
      if (this.providers.has(p.platform)) {
        throw new Error(`Duplicate onboarding provider for platform="${p.platform}"`);
      }
      this.providers.set(p.platform, p);
    }
  }

  async start(input: {
    tenantId?: string;
    platform: string;
    params: Record<string, unknown>;
  }): Promise<{ session: OnboardingSession; step: OnboardingStep }> {
    const provider = this.requireProvider(input.platform);
    const session = await this.sessionStore.create(input);

    let step: OnboardingStep;
    try {
      step = await provider.start({ session }, input.params);
    } catch (err) {
      await this.sessionStore.remove(session.sessionId);
      throw err;
    }

    await this.advance(session, step);
    return { session, step };
  }

  async submit(input: {
    sessionId: string;
    stepKey: string;
    payload: Record<string, unknown>;
  }): Promise<{ session: OnboardingSession; step: OnboardingStep }> {
    const session = await this.sessionStore.get(input.sessionId);
    if (!session) {
      return {
        session: stubSession(input.sessionId),
        step: errorStep('SESSION_NOT_FOUND', 'Onboarding session expired or not found.', false),
      };
    }
    if (session.expectedStepKey !== input.stepKey) {
      // Out-of-order submit (double-click, stale tab). Don't advance state —
      // re-emit the step the client should be on, so the UI can recover.
      return {
        session,
        step: errorStep(
          'STEP_KEY_MISMATCH',
          `Expected step "${session.expectedStepKey}", got "${input.stepKey}".`,
          true,
        ),
      };
    }

    const provider = this.requireProvider(session.platform);
    const step = await provider.submit({ session }, input.stepKey, input.payload);
    await this.advance(session, step);
    return { session, step };
  }

  async cancel(sessionId: string): Promise<void> {
    const session = await this.sessionStore.get(sessionId);
    if (!session) return;
    const provider = this.providers.get(session.platform);
    if (provider) {
      try {
        await provider.cancel({ session });
      } catch (err) {
        this.logger.warn(`Provider cancel failed for ${session.platform}/${sessionId}: ${String(err)}`);
      }
    }
    await this.sessionStore.remove(sessionId);
  }

  private requireProvider(platform: string): OnboardingProvider {
    const provider = this.providers.get(platform);
    if (!provider) throw new Error(`No onboarding provider registered for platform="${platform}"`);
    return provider;
  }

  /**
   * Persists the next-step expectation. Terminal states (done/error) drop
   * the session — at that point the credentials (or failure) are returned
   * to the client and Redis state is no longer useful.
   */
  private async advance(session: OnboardingSession, step: OnboardingStep): Promise<void> {
    if (step.type === 'done' || step.type === 'error') {
      await this.sessionStore.remove(session.sessionId);
      return;
    }
    session.expectedStepKey = step.key;
    await this.sessionStore.update(session);
  }
}

function errorStep(code: string, message: string, retriable: boolean): OnboardingStep {
  return { type: 'error', key: 'error', data: { code, message, retriable } };
}

function stubSession(sessionId: string): OnboardingSession {
  const now = new Date().toISOString();
  return {
    sessionId,
    platform: 'unknown',
    params: {},
    meta: {},
    expectedStepKey: 'error',
    createdAt: now,
    updatedAt: now,
  };
}
