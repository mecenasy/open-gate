import { Injectable, Logger } from '@nestjs/common';
import { BindingPlatform } from '@app/entities';
import { Platform } from '../../../types/platform';
import { Transform, type TransformContext } from '../transformer';
import { SignalMessage } from './types';
import { Type, UnifiedMessage } from 'src/notify-service/types/unified-message';
import { PlatformIdentityDbClient } from 'src/notify-service/platform-identity/platform-identity-db.client';

type Message = UnifiedMessage<SignalMessage>;

@Injectable()
export class SignalTransformer extends Transform {
  platform = Platform.Signal;
  private readonly logger = new Logger(SignalTransformer.name);

  constructor(private readonly identityClient: PlatformIdentityDbClient) {
    super();
  }

  async transform(data: SignalMessage, ctx?: TransformContext): Promise<UnifiedMessage<SignalMessage>> {
    console.log('🚀 ~ SignalTransformer ~ transform ~ data:', data);
    const { envelope, account } = data;

    let media: Message['media'];

    if (envelope.dataMessage?.attachments?.[0]) {
      media = {
        url: envelope.dataMessage?.attachments?.[0].id,
        contentType: envelope.dataMessage?.attachments?.[0].contentType,
      };
    }
    let group: Message['group'];

    if (envelope.dataMessage?.groupInfo) {
      group = {
        id: envelope.dataMessage?.groupInfo?.groupId,
        name: envelope.dataMessage?.groupInfo?.groupName,
      };
    }

    const chatId = await this.resolveChatId(envelope, ctx?.tenantId);

    const message: Message = {
      platform: this.platform,
      chatId,
      authorId: account,
      messageId: '',
      content: envelope.dataMessage?.message ?? '',
      raw: data,
      media,
      group,
      type: media ? Type.Image : Type.Text,
    };

    return message;
  }

  /**
   * From signal-cli REST 0.93+ envelope.source is the sender's UUID, not
   * their phone number, when "Phone Number Privacy" is on. Downstream
   * (core-service) still keys identity by phone, so map UUID → phone via
   * the platform_identities table here. Fallback chain:
   *
   *   1. envelope.sourceNumber — present for accounts that share their number
   *   2. platform_identities lookup by (tenantId, signal, sourceUuid) — the
   *      common path for already-bound users
   *   3. envelope.source (= sourceUuid) — unknown sender; downstream lands
   *      in the existing "User not found" flow
   */
  private async resolveChatId(envelope: SignalMessage['envelope'], tenantId: string | undefined): Promise<string> {
    if (envelope.sourceNumber) {
      return envelope.sourceNumber;
    }
    if (tenantId && envelope.sourceUuid) {
      try {
        const resolved = await this.identityClient.resolvePhoneByPlatformUserId(
          tenantId,
          BindingPlatform.Signal,
          envelope.sourceUuid,
        );
        if (resolved.found && resolved.phoneE164) {
          return resolved.phoneE164;
        }
      } catch (err) {
        // Don't break the message pipeline if db-service is hiccuping;
        // fall through to the UUID fallback so the user still sees the
        // existing "unknown user" flow rather than silent loss.
        this.logger.warn(`Identity lookup failed for ${envelope.sourceUuid}: ${(err as Error).message}`);
      }
    }
    return envelope.source;
  }
}
