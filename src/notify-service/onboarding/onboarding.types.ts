/**
 * Generic, transport-neutral types for the platform onboarding flow.
 * Each platform implements an OnboardingProvider that returns these
 * step descriptors; the controller serializes them into the gRPC contract.
 */

export type OnboardingIntent = 'initial' | 'replace';

export type OnboardingStep =
  | { type: 'form'; key: string; data: Record<string, unknown> }
  | { type: 'qrcode'; key: string; data: { qrPngBase64: string; instructions: string[] } }
  | {
      type: 'captcha';
      key: string;
      data: {
        // External captcha solving page (signalcaptchas.org/...). The frontend
        // typically wraps it via a same-origin proxy page so it can postMessage
        // the resulting token back; the URL is informational.
        captchaUrl: string;
        // Format: 'signalcaptcha://signal-hcaptcha.<sitekey>.registration.<hCaptchaResponse>'.
        // Frontend constructs the full token from the hCaptcha response on the
        // proxy page and submits the whole thing as payload.captchaToken.
        tokenScheme: string;
        // hCaptcha sitekey. Same value Signal uses on signalcaptchas.org.
        siteKey: string;
        instructions: string[];
      };
    }
  | { type: 'verification_code'; key: string; data: { channel: 'sms' | 'voice'; recipient: string } }
  | { type: 'info'; key: string; data: { title: string; body: string; severity: 'info' | 'warning' } }
  | {
      // Server-driven branching. The provider picks `reasonCode` (e.g.
      // 'signal_gateway_unreachable') and a list of opaque option values; the
      // frontend maps both to localized copy and renders a choice dialog.
      type: 'choice';
      key: string;
      data: {
        reasonCode: string;
        // Context the frontend can interpolate into the i18n template
        // (e.g. { apiUrl, defaultApiUrl } for an unreachable gateway).
        context: Record<string, unknown>;
        options: Array<{ value: string }>;
      };
    }
  | { type: 'done'; key: string; data: { credentialsJson: string } }
  | { type: 'error'; key: string; data: { code: string; message: string; retriable: boolean } };

export interface OnboardingSession {
  sessionId: string;
  tenantId?: string;
  platform: string;
  /** Free-form per-platform parameters (e.g. signal: { apiUrl, account, mode, intent }). */
  params: Record<string, unknown>;
  /** Free-form per-platform mid-flow state (e.g. last captcha token, last challenge id). */
  meta: Record<string, unknown>;
  /** Last step the provider emitted — the next submit must reference this key. */
  expectedStepKey: string;
  /** ISO timestamp; set so we can spot stale sessions in logs even if Redis already evicted them. */
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingContext {
  session: OnboardingSession;
}
