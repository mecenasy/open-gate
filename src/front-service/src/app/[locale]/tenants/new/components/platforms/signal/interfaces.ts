/**
 * Mirror of notify-service's OnboardingStep DU. The server returns the
 * step type and a JSON-serialized data blob; we re-parse on the client
 * into a typed union for safe rendering.
 */

export type OnboardingStep =
  | { type: 'qrcode'; key: string; data: { qrPngBase64: string; instructions: string[] } }
  | {
      type: 'captcha';
      key: string;
      data: {
        captchaUrl: string;
        tokenScheme: string;
        siteKey: string;
        instructions: string[];
      };
    }
  | { type: 'verification_code'; key: string; data: { channel: 'sms' | 'voice'; recipient: string } }
  | { type: 'info'; key: string; data: { title: string; body: string; severity: 'info' | 'warning' } }
  | {
      type: 'choice';
      key: string;
      data: {
        reasonCode: string;
        context: Record<string, unknown>;
        options: Array<{ value: string }>;
      };
    }
  | { type: 'done'; key: string; data: { credentialsJson: string } }
  | { type: 'error'; key: string; data: { code: string; message: string; retriable: boolean } };

export interface OnboardingStepResponse {
  sessionId: string;
  stepType: string;
  stepKey: string;
  dataJson: string;
  error?: string | null;
  success: boolean;
}
