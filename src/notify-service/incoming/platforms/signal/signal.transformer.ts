import { Injectable } from '@nestjs/common';
import { Platform } from '../../../types/platform';
import { Transform } from '../transformer';
import { SignalMessage } from './types';
import { Type, UnifiedMessage } from 'src/notify-service/types/unified-message';

type Message = UnifiedMessage<SignalMessage>;

@Injectable()
export class SignalTransformer extends Transform {
  platform = Platform.Signal;

  transform(data: SignalMessage): Promise<UnifiedMessage<SignalMessage>> {
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

    const message: Message = {
      platform: this.platform,
      chatId: envelope.source,
      authorId: account,
      messageId: '',
      content: envelope.dataMessage?.message ?? '',
      raw: data,
      media,
      group,
      type: media ? Type.Image : Type.Text,
    };

    return Promise.resolve(message);
  }
}
