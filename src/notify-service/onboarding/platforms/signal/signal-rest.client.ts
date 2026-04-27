import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

const HEALTH_TIMEOUT_MS = 3_000;
const REGISTER_TIMEOUT_MS = 15_000;
const QRCODE_TIMEOUT_MS = 30_000;

export interface SignalRegisterError {
  /** 'captcha_required' | 'rate_limited' | 'invalid_number' | 'other' */
  kind: 'captcha_required' | 'rate_limited' | 'invalid_number' | 'other';
  status?: number;
  message: string;
}

/**
 * Thin wrapper over the bbernhard/signal-cli-rest-api endpoints we drive
 * during onboarding. Methods that may legitimately fail (gateway down,
 * captcha required) return discriminated results instead of throwing —
 * the provider needs to branch on those, not catch.
 */
@Injectable()
export class SignalRestClient {
  private readonly logger = new Logger(SignalRestClient.name);

  constructor(private readonly http: HttpService) {}

  async healthCheck(apiUrl: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get(`${trimSlash(apiUrl)}/v1/about`, {
          timeout: HEALTH_TIMEOUT_MS,
          // signal-cli-rest-api responds 200 OK with version JSON; anything
          // else (timeout, ECONNREFUSED, 5xx) means the gateway is unhealthy.
          validateStatus: (s) => s >= 200 && s < 300,
        }),
      );
      return res.status >= 200 && res.status < 300;
    } catch (err) {
      this.logger.warn(`Signal gateway healthcheck failed for ${apiUrl}: ${describeError(err)}`);
      return false;
    }
  }

  async getQrCodeLink(apiUrl: string, deviceName: string): Promise<{ pngBase64: string }> {
    const res = await firstValueFrom(
      this.http.get<ArrayBuffer>(`${trimSlash(apiUrl)}/v1/qrcodelink`, {
        params: { device_name: deviceName, qrcode_version: 11 },
        responseType: 'arraybuffer',
        timeout: QRCODE_TIMEOUT_MS,
      }),
    );
    return { pngBase64: Buffer.from(res.data).toString('base64') };
  }

  async register(
    apiUrl: string,
    number: string,
    body: { use_voice: boolean; captcha?: string },
  ): Promise<{ ok: true } | { ok: false; error: SignalRegisterError }> {
    try {
      await firstValueFrom(
        this.http.post(`${trimSlash(apiUrl)}/v1/register/${encodeURIComponent(number)}`, body, {
          timeout: REGISTER_TIMEOUT_MS,
        }),
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, error: classifyRegisterError(err) };
    }
  }

  async verify(apiUrl: string, number: string, code: string, pin?: string): Promise<{ ok: boolean; message?: string }> {
    try {
      await firstValueFrom(
        this.http.post(
          `${trimSlash(apiUrl)}/v1/register/${encodeURIComponent(number)}/verify/${encodeURIComponent(code)}`,
          pin ? { pin } : {},
          { timeout: REGISTER_TIMEOUT_MS },
        ),
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, message: describeError(err) };
    }
  }

  async unregister(apiUrl: string, number: string): Promise<{ ok: boolean; message?: string }> {
    try {
      await firstValueFrom(
        this.http.post(
          `${trimSlash(apiUrl)}/v1/unregister/${encodeURIComponent(number)}`,
          {},
          { timeout: REGISTER_TIMEOUT_MS },
        ),
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, message: describeError(err) };
    }
  }

  async listAccounts(apiUrl: string): Promise<string[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<string[]>(`${trimSlash(apiUrl)}/v1/accounts`, { timeout: HEALTH_TIMEOUT_MS }),
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      this.logger.warn(`listAccounts failed: ${describeError(err)}`);
      return [];
    }
  }
}

function trimSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function classifyRegisterError(err: unknown): SignalRegisterError {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data;
    const msg = typeof body === 'string' ? body : JSON.stringify(body ?? err.message);
    // signal-cli-rest-api surfaces the upstream Signal server response.
    // 402 / "Captcha required" is the canonical "needs captcha" signal.
    if (status === 402 || /captcha/i.test(msg)) {
      return { kind: 'captcha_required', status, message: msg };
    }
    if (status === 429) return { kind: 'rate_limited', status, message: msg };
    if (status === 400 && /number/i.test(msg)) return { kind: 'invalid_number', status, message: msg };
    return { kind: 'other', status, message: msg };
  }
  return { kind: 'other', message: err instanceof Error ? err.message : String(err) };
}

function describeError(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data;
    return `${status ?? 'NO_STATUS'} ${typeof body === 'string' ? body : JSON.stringify(body ?? err.message)}`;
  }
  return err instanceof Error ? err.message : String(err);
}
