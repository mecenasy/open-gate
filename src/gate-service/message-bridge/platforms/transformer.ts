import { Injectable } from '@nestjs/common';
import { Platform } from '../platform';

export enum Type {
  Text = 'text',
  Image = 'image',
  Audio = 'audio',
  Poll = 'poll',
  Reaction = 'reaction',
}

export interface UnifiedMessage<T = any> {
  platform: Platform;
  chatId: string;
  authorId: string;
  messageId: string;
  is_group?: boolean;

  type: Type;
  content?: string;

  media?: {
    url: string;
    contentType: string;
    data?: Buffer;
    duration?: number;
  };

  poll?: {
    question: string;
    options: Array<{ id: string; text: string }>;
  };

  reaction?: {
    emoji: string;
    target_message_id: string;
  };

  raw: T;
}

@Injectable()
export abstract class Transform {
  platform: Platform;

  abstract transform(data: any): Promise<UnifiedMessage>;
}
