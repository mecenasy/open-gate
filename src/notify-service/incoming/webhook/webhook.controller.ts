import { Body, Controller, Headers, HttpException, Inject, Logger, Param, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { IncomingHttpHeaders } from 'http';
import { WebhookHandler, type WebhookResponse } from './webhook.handler';

/**
 * Public-facing HTTP ingress for inbound webhooks. The edge proxy
 * (Caddy) routes /webhooks/* directly here so BFF never sees the
 * traffic. Dispatch picks the WebhookHandler whose provider matches the
 * `:provider` route segment, then mirrors the handler's response shape
 * (status code / content-type / body) back to the upstream.
 *
 * URL reconstruction priority:
 *   1. WEBHOOK_BASE_URL env when set + originalUrl — preferred. The
 *      proxy chain may rewrite host/proto in ways that don't match
 *      what's registered with the upstream provider.
 *   2. x-forwarded-proto / x-forwarded-host / host headers — fallback
 *      for deployments without WEBHOOK_BASE_URL set.
 */
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @Inject(WebhookHandler) private readonly handlers: WebhookHandler[],
    private readonly configService: ConfigService,
  ) {}

  @Post(':provider/:path')
  async handle(
    @Param('provider') provider: string,
    @Param('path') path: string,
    @Headers() headers: IncomingHttpHeaders,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: Record<string, unknown>,
  ): Promise<string> {
    console.log('🚀 ~ WebhookController ~ handley:', body);
    const handler = this.handlers.find((h) => h.provider === provider);
    if (!handler) {
      this.logger.warn(`Unknown webhook provider '${provider}' (path='${path}'); dropping.`);
      return this.respond(res, { statusCode: 404, contentType: 'text/plain; charset=utf-8', body: '' });
    }

    const result = await handler.handle({
      provider,
      path,
      fullUrl: this.resolveFullUrl(req),
      headers: lowerCaseHeaders(headers),
      formFields: stringifyFields(body),
    });
    return this.respond(res, result);
  }

  private respond(res: Response, result: WebhookResponse): string {
    const statusCode = result.statusCode > 0 ? result.statusCode : 200;
    const contentType = result.contentType?.length ? result.contentType : 'text/plain; charset=utf-8';
    res.status(statusCode);
    res.setHeader('Content-Type', contentType);
    // 5xx → throw so the global exception filter logs it; 4xx is a
    // routine handler decision, just mirror it on res.
    if (statusCode >= 500) {
      throw new HttpException(result.body || 'Webhook handler error', statusCode);
    }
    return result.body ?? '';
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
}

function pickHeader(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function stringifyFields(body: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      out[key] = value;
    } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      out[key] = value.toString();
    } else {
      out[key] = JSON.stringify(value);
    }
  }
  return out;
}

function lowerCaseHeaders(headers: IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v === undefined) continue;
    out[key.toLowerCase()] = v;
  }
  return out;
}
