import { Platform } from './platform';

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

  group?: {
    id: string;
    name: string;
  };

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
    targetMessageId: string;
  };

  raw: T;
}
