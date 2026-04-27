import type { OnboardingContext, OnboardingStep } from '../onboarding.types';

/**
 * Each platform that needs an interactive setup flow (Signal phone
 * registration, WhatsApp embedded signup, ...) implements this interface
 * and registers itself by `platform` key. The dispatcher (OnboardingService)
 * routes Start/Submit calls to the matching provider.
 */
export abstract class OnboardingProvider {
  /** Platform key (matches PlatformConfigService keys: 'signal' | 'whatsapp' | ...). */
  abstract readonly platform: string;

  /**
   * Validate `params`, kick off any external calls and return the FIRST step
   * the user has to act on. May return `done` straight away if the platform
   * has no interactive flow.
   */
  abstract start(ctx: OnboardingContext, params: Record<string, unknown>): Promise<OnboardingStep>;

  /**
   * React to a client submission for `stepKey`. The dispatcher has already
   * verified `stepKey === ctx.session.expectedStepKey`, so the provider can
   * focus on consuming the payload and producing the next step.
   */
  abstract submit(ctx: OnboardingContext, stepKey: string, payload: Record<string, unknown>): Promise<OnboardingStep>;

  /** Best-effort cleanup (e.g. tell the upstream gateway to drop the session). */
  abstract cancel(ctx: OnboardingContext): Promise<void>;
}
