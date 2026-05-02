import { Injectable } from '@nestjs/common';

/**
 * Provider-agnostic shape of an inbound webhook the dispatch layer hands
 * to a handler — raw form-data + headers + reconstructed full URL. Same
 * fields whether the request entered via direct HTTP (current setup,
 * edge proxy → notify) or any future gRPC bridge.
 */
export interface WebhookRequest {
  /** Provider key from the route — first segment after /webhooks/. */
  provider: string;
  /** Remaining path segments joined by '/' (e.g. 'sms', 'voice'). */
  path: string;
  /** Full URL the upstream used to reach the public ingress; required
   *  for signature schemes that sign URL || body. */
  fullUrl: string;
  /** Lower-cased header keys; multi-value collapsed to the first value. */
  headers: Record<string, string>;
  /** Form-urlencoded body fields; values stringified. */
  formFields: Record<string, string>;
}

export interface WebhookResponse {
  statusCode: number;
  contentType: string;
  body: string;
}

/**
 * Base for provider-specific inbound-webhook handlers. The HTTP
 * dispatcher (WebhookController) finds the handler whose `provider`
 * matches the route segment and forwards the raw request — signature
 * validation, sub-path routing, and response shape (status / type / body)
 * all live in the concrete handler.
 */
@Injectable()
export abstract class WebhookHandler {
  abstract readonly provider: string;

  abstract handle(request: WebhookRequest): Promise<WebhookResponse>;
}
