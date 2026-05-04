import { Injectable, Logger } from '@nestjs/common';
import { BindingPlatform } from '@app/entities';
import type { SignalMessage } from '../incoming/platforms/signal/types';
import { ContactBindingDbClient } from './contact-binding-db.client';
import { BffContactBindingPushClient } from './bff-binding-push.client';

// Mirror of token suffix shape from db-service/contact-binding/token.util.ts.
// Two copies because notify-service shouldn't pull db-service modules; the
// alphabet is stable so drift is unlikely.
const BINDING_TOKEN_PATTERN = /og-[a-hjkmnp-z2-9]{6}/i;

/**
 * Inspects every incoming Signal data message before it gets fanned out to
 * the regular pipeline. If the recipient is replying to a binding invite —
 * either by quoting our outbound message (primary, single-tap UX) or by
 * echoing the og-XXXXXX token in plaintext (regex fallback for users who
 * don't use Reply) — we verify the binding, push the result to BFF, and
 * tell the caller to swallow the message.
 *
 * Returning true means "binding handled, do not publish MessageEvent" so
 * the verification text doesn't leak into core-service as a regular chat.
 */
@Injectable()
export class BindingTokenDetectorService {
  private readonly logger = new Logger(BindingTokenDetectorService.name);

  constructor(
    private readonly bindingClient: ContactBindingDbClient,
    private readonly bffPush: BffContactBindingPushClient,
  ) {}

  async detect(msg: SignalMessage, tenantId: string): Promise<boolean> {
    const dataMessage = msg.envelope?.dataMessage;
    if (!dataMessage) return false;

    const sourceUuid = msg.envelope.sourceUuid;
    if (!sourceUuid) return false;

    const binding = await this.findBinding(dataMessage.quote?.id, dataMessage.message ?? '');
    if (!binding) return false;

    if (binding.tenantId !== tenantId) {
      this.logger.warn(
        `Binding match for cross-tenant quote/token (binding ${binding.id} tenant=${binding.tenantId}, msg tenant=${tenantId}); ignoring`,
      );
      return false;
    }

    const verified = await this.bindingClient.verifyBinding(binding.id, sourceUuid, msg.envelope.sourceName ?? null);
    if (!verified) {
      // Lost the verify race or binding expired between find and verify.
      this.logger.warn(`Binding ${binding.id} not verifiable (expired or already verified)`);
      return false;
    }

    this.logger.log(
      `✅ Binding ${verified.id} verified via ${dataMessage.quote?.id ? 'quote' : 'regex'}: user=${verified.userId} uuid=${sourceUuid}`,
    );

    await this.bffPush.forwardBindingVerified({
      bindingId: verified.id,
      tenantId: verified.tenantId,
      userId: verified.userId,
      platform: BindingPlatform.Signal,
      platformUserId: sourceUuid,
      phoneE164: verified.phoneE164,
    });

    return true;
  }

  private async findBinding(quoteId: number | undefined, body: string) {
    if (typeof quoteId === 'number') {
      const byQuote = await this.bindingClient.findByOutboundMessageId(String(quoteId));
      if (byQuote) return byQuote;
    }
    const m = body.match(BINDING_TOKEN_PATTERN);
    if (m) {
      return this.bindingClient.findByToken(m[0].toLowerCase(), true);
    }
    return null;
  }
}
