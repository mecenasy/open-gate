import { Injectable } from '@nestjs/common';
import { Platform } from '../../platform';
import { Transform, Type, UnifiedMessage } from '../transformer';
import { SignalMessage } from './types';

type Message = UnifiedMessage<SignalMessage>;

@Injectable()
export class SignalTransformer extends Transform {
  platform = Platform.Signal;

  transform(data: SignalMessage): Promise<UnifiedMessage<SignalMessage>> {
    const { envelope, account } = data;

    let media: Message['media'];

    if (envelope.dataMessage?.attachments?.[0]) {
      media = {
        url: envelope.dataMessage?.attachments?.[0].id,
        contentType: envelope.dataMessage?.attachments?.[0].contentType,
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
      type: media ? Type.Image : Type.Text,
    };

    return Promise.resolve(message);
  }
}
