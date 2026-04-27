'use client';

import { useEffect } from 'react';

/**
 * Listens for the same-origin postMessage emitted by /signal-captcha when
 * the user solves the hCaptcha. The popup builds the
 * `signalcaptcha://signal-hcaptcha.<sitekey>.registration.<response>` token
 * itself; we just forward it to the caller.
 *
 * Only listens while `enabled` is true so we don't process tokens that
 * arrive when the user isn't on the captcha step (e.g. stale popup left
 * open from a previous attempt).
 */
export function useCaptchaListener(enabled: boolean, onToken: (token: string) => void): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; token?: string } | null;
      if (!data || data.type !== 'signal-captcha-token') return;
      if (typeof data.token !== 'string') return;
      onToken(data.token);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [enabled, onToken]);
}

export function openSignalCaptchaPopup(): Window | null {
  // Routed outside [locale] and excluded from the next-intl middleware
  // (see middleware.ts matcher) so the popup loads without locale prefix
  // and without auth redirects.
  return window.open(
    '/signal-captcha',
    'signal-captcha',
    'width=520,height=680,resizable=yes,scrollbars=yes',
  );
}
