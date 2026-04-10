import { Query } from '@nestjs/cqrs';
import { Message } from 'src/proto/messages';

export class GetMessageQuery extends Query<Message | null> {
  constructor(public readonly key: string) {
    super();
  }
}
