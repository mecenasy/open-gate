import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import { DEFAULT_PLATFORM_FALLBACK_ID, PlatformConfigService } from '../../../platform-config/platform-config.service';

/**
 * Validates the `X-Twilio-Signature` header on inbound webhooks. Twilio
 * signs `URL || sorted(form-params concatenated as key=value)` with
 * HMAC-SHA1 keyed by our auth token. Without this check anyone hitting
 * the webhook endpoint could inject SMS events for any tenant.
 *
 * URL resolution order:
 *   1. WEBHOOK_BASE_URL env (when set) + request originalUrl — preferred
 *      because the proxy chain may rewrite host/proto in ways that don't
 *      match what we registered on the number.
 *   2. Request headers (x-forwarded-proto / host / originalUrl) — fallback
 *      for setups where WEBHOOK_BASE_URL isn't configured.
 *
 * Auth token comes from the master SMS row at DEFAULT_PLATFORM_FALLBACK_ID
 * (same source the procurement provider uses). Rotation is automatic on
 * the next request.
 */
@Injectable()
export class TwilioSignatureGuard implements CanActivate {
  private readonly logger = new Logger(TwilioSignatureGuard.name);

  constructor(
    private readonly platformConfig: PlatformConfigService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const signature = pickHeader(req.headers['x-twilio-signature']);
    if (!signature) {
      this.logger.warn('Twilio webhook rejected: missing X-Twilio-Signature header.');
      return false;
    }

    const master = await this.platformConfig.getConfig(DEFAULT_PLATFORM_FALLBACK_ID, 'sms');
    if (!master?.token) {
      this.logger.error('Twilio webhook rejected: master auth token unavailable.');
      return false;
    }

    const url = this.resolveFullUrl(req);
    const params = this.extractParams(req);
    const valid = validateRequest(master.token, signature, url, params);
    if (!valid) {
      this.logger.warn(`Twilio webhook rejected: signature mismatch (url=${url}).`);
    }
    return valid;
  }

  private resolveFullUrl(req: Request): string {
    const configured = this.configService.get<string>('WEBHOOK_BASE_URL');
    if (configured && configured.length > 0) {
      return stripTrailingSlash(configured) + req.originalUrl;
    }
    const proto = pickHeader(req.headers['x-forwarded-proto']) ?? req.protocol;
    const host = pickHeader(req.headers['x-forwarded-host']) ?? req.headers['host'] ?? '';
    return `${proto}://${host}${req.originalUrl}`;
  }

  private extractParams(req: Request): Record<string, string> {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      out[key] = typeof value === 'string' ? value : String(value);
    }
    return out;
  }
}

function pickHeader(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
