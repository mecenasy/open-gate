import { Query } from '@nestjs/cqrs';
import { Message } from 'src/proto/messages';

export class GetAllMessagesQuery extends Query<{ data: Message[]; total: number }> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    super();
  }
}
