/** hCaptcha sitekey baked into signalcaptchas.org. Public, identical for all
 *  self-hosted clients — Signal accepts only this sitekey for registration tokens. */
export const SIGNAL_HCAPTCHA_SITEKEY = '5fad97ac-7d06-4e44-b18a-b950b20148ff';

/** Token scheme that signal-cli REST expects in the `captcha` field. */
export const SIGNAL_CAPTCHA_TOKEN_SCHEME = `signalcaptcha://signal-hcaptcha.${SIGNAL_HCAPTCHA_SITEKEY}.registration.<hCaptchaResponse>`;

export const SIGNAL_CAPTCHA_PAGE_URL = 'https://signalcaptchas.org/registration/generate.html';

export type SignalOnboardingMode = 'register' | 'link';

export type SignalOnboardingIntent = 'initial' | 'replace';

export interface SignalOnboardingParams {
  /** Optional — when omitted/empty we use the default gateway from DB sentinel row. */
  apiUrl?: string;
  /** E.164 phone number, e.g. '+48501234567'. */
  account: string;
  mode: SignalOnboardingMode;
  intent: SignalOnboardingIntent;
  /** Required when intent='replace' — the previous account on the bridge to unregister. */
  previousAccount?: string;
  /** Used as device label when mode='link'. Defaults to 'open-gate' if missing. */
  deviceName?: string;
}

/** Persisted in OnboardingSession.meta across submits. */
export interface SignalOnboardingMeta {
  /** Resolved gateway URL after start (user-supplied OR default after `use_default` choice). */
  resolvedApiUrl?: string;
  /** Set after the user solves captcha; sent verbatim to signal-cli on the next register call. */
  captchaToken?: string;
  /** True once registration POST returned 2xx — verification step is allowed. */
  registrationStarted?: boolean;
}

/** Step keys — used by both server (expectedStepKey) and the XState machine. */
export const SIGNAL_STEP_KEYS = {
  GATEWAY_CHOICE: 'gateway_choice',
  QRCODE_CONFIRM: 'qrcode_confirm',
  CAPTCHA_TOKEN: 'captcha_token',
  VERIFY_CODE: 'verify_code',
} as const;
