import {
  BadGatewayException,
  Body,
  Controller,
  Header,
  Headers,
  HttpCode,
  Inject,
  Logger,
  OnModuleInit,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import {
  PHONE_PROCUREMENT_NOTIFY_SERVICE_NAME,
  type PhoneProcurementNotifyServiceClient,
} from 'src/proto/phone-procurement';
import { Public } from '@app/auth';

/**
 * Public-facing Twilio webhook endpoint. notify-service is not exposed to
 * the internet, so BFF stays the single ingress: receives the form-urlencoded
 * POST + X-Twilio-Signature header, reconstructs the full URL Twilio used
 * (so signature validation has the same string Twilio signed), and forwards
 * the bundle to notify via gRPC.
 *
 * URL reconstruction priority:
 *   1. WEBHOOK_BASE_URL env (when set) + originalUrl — preferred. The proxy
 *      chain may rewrite host/proto in ways that don't match what's
 *      registered on the Twilio number.
 *   2. x-forwarded-proto / x-forwarded-host / host headers — fallback for
 *      setups behind a properly configured proxy without WEBHOOK_BASE_URL.
 *
 * SMS route returns plain status:200; voice route returns the TwiML body
 * notify-service produced (polite hangup) with the right content-type.
 *
 * Throttling: dedicated 'public' tier (30 req/min) — Twilio retries on
 * non-2xx but doesn't burst, so this absorbs runaway retry loops while
 * still allowing legitimate traffic.
 */
@Controller('webhooks/twilio')
@UseGuards(ThrottlerGuard)
@Public()
@Throttle({ public: { limit: 60, ttl: 60_000 } })
export class TwilioWebhookProxyController implements OnModuleInit {
  private readonly logger = new Logger(TwilioWebhookProxyController.name);
  private notifyGrpc!: PhoneProcurementNotifyServiceClient;

  constructor(
    @Inject(NotifyGrpcKey) private readonly notifyClient: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.notifyGrpc = this.notifyClient.getService<PhoneProcurementNotifyServiceClient>(
      PHONE_PROCUREMENT_NOTIFY_SERVICE_NAME,
    );
  }

  @Post('sms')
  @HttpCode(200)
  async sms(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @Headers('x-twilio-signature') signature: string | undefined,
  ): Promise<{ ok: boolean }> {
    console.log('🚀 ~ TwilioWebhookProxyController ~ sms ~ body:', body);
    const result = await this.forward('sms', req, body, signature);
    return { ok: result.status };
  }

  @Post('voice')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml; charset=utf-8')
  async voice(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @Headers('x-twilio-signature') signature: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const result = await this.forward('voice', req, body, signature);
    if (!result.status) {
      // notify-service rejected (signature, etc.) — drop a 403-style empty
      // TwiML so Twilio doesn't keep retrying with a bad request.
      res.status(403);
      return '';
    }
    return result.twiml ?? '';
  }

  private async forward(
    kind: 'sms' | 'voice',
    req: Request,
    body: Record<string, unknown>,
    signature: string | undefined,
  ): Promise<{ status: boolean; message?: string; twiml?: string }> {
    if (!signature) {
      this.logger.warn('Twilio webhook missing X-Twilio-Signature; dropping.');
      return { status: false, message: 'Missing signature.' };
    }
    const fullUrl = this.resolveFullUrl(req);
    const formFields = stringifyFields(body);

    try {
      const res = await lastValueFrom(this.notifyGrpc.handleTwilioWebhook({ kind, fullUrl, signature, formFields }));
      if (!res.status) {
        this.logger.warn(`Twilio webhook ${kind} rejected by notify-service: ${res.message}`);
      }
      return { status: res.status, message: res.message, twiml: res.twiml };
    } catch (err) {
      this.logger.error(
        `Twilio webhook ${kind} forward to notify-service failed: ${err instanceof Error ? err.stack : String(err)}`,
      );
      throw new BadGatewayException('Webhook forwarding failed');
    }
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
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    out[key] = typeof value === 'string' ? value : String(value);
  }
  return out;
}
