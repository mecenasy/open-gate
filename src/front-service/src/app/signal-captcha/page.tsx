'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Same-origin proxy page for solving the Signal registration hCaptcha.
 *
 * Why this page exists:
 *  - signalcaptchas.org returns the token embedded in a `signalcaptcha://`
 *    anchor href. We can't read that anchor from a popup we open against
 *    that domain (cross-origin DOM access).
 *  - The hCaptcha sitekey Signal uses is public and the protocol token
 *    format is `signalcaptcha://signal-hcaptcha.<sitekey>.registration.<hCaptchaResponse>`.
 *    Hosting the same widget locally lets us assemble that token from the
 *    raw hCaptcha response and postMessage it to window.opener.
 *  - postMessage is same-origin → safe and trustworthy for the opener.
 *
 * Routing: the page lives outside `[locale]` and is excluded from the
 * next-intl middleware matcher (see `src/middleware.ts`) so the popup
 * loads under `/signal-captcha` without a locale prefix and without the
 * auth gate. The root layout still wraps it in `<html>/<body>`.
 */
const SIGNAL_HCAPTCHA_SITEKEY = '5fad97ac-7d06-4e44-b18a-b950b20148ff';

function buildToken(hCaptchaResponse: string): string {
  return `signalcaptcha://signal-hcaptcha.${SIGNAL_HCAPTCHA_SITEKEY}.registration.${hCaptchaResponse}`;
}

declare global {
  interface Window {
    onSignalCaptchaSolved?: (response: string) => void;
    onSignalCaptchaExpired?: () => void;
    onSignalCaptchaError?: () => void;
  }
}

export default function SignalCaptchaPage() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'solved' | 'error' | 'expired'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    window.onSignalCaptchaSolved = (response: string) => {
      const token = buildToken(response);
      const target = window.opener as Window | null;
      if (target) {
        target.postMessage({ type: 'signal-captcha-token', token }, window.location.origin);
      }
      setStatus('solved');
      setTimeout(() => window.close(), 600);
    };
    window.onSignalCaptchaExpired = () => setStatus('expired');
    window.onSignalCaptchaError = () => {
      setErrorMsg('hCaptcha widget error.');
      setStatus('error');
    };
    return () => {
      window.onSignalCaptchaSolved = undefined;
      window.onSignalCaptchaExpired = undefined;
      window.onSignalCaptchaError = undefined;
    };
  }, []);

  return (
    <div
      style={{
        margin: 0,
        padding: 24,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#0d1117',
        color: '#e6edf3',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 18, margin: 0 }}>Signal captcha</h1>
      <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 360, textAlign: 'center' }}>
        Solve the captcha below — the token will be sent back to the registration window automatically.
      </p>

      <Script
        src="https://js.hcaptcha.com/1/api.js"
        strategy="afterInteractive"
        onReady={() => setStatus('ready')}
        onError={() => {
          setErrorMsg('Failed to load hCaptcha.');
          setStatus('error');
        }}
      />

      <div
        className="h-captcha"
        data-sitekey={SIGNAL_HCAPTCHA_SITEKEY}
        data-callback="onSignalCaptchaSolved"
        data-expired-callback="onSignalCaptchaExpired"
        data-error-callback="onSignalCaptchaError"
        data-theme="dark"
      />

      {status === 'loading' && <p style={{ fontSize: 12, opacity: 0.6 }}>Loading…</p>}
      {status === 'solved' && <p style={{ fontSize: 12, color: '#7ee787' }}>Token sent. Closing…</p>}
      {status === 'expired' && (
        <p style={{ fontSize: 12, color: '#f0883e' }}>Captcha expired — please solve again.</p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 12, color: '#ff7b72' }}>Error: {errorMsg ?? 'unknown'}</p>
      )}
    </div>
  );
}
