import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllMessagesQuery } from '../impl/get-all-messages.query';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@QueryHandler(GetAllMessagesQuery)
export class GetAllMessagesHandler implements IQueryHandler<GetAllMessagesQuery, { data: Message[]; total: number }> {
  constructor(private readonly messagesService: MessagesService) {}

  async execute(query: GetAllMessagesQuery): Promise<{ data: Message[]; total: number }> {
    const { messages, total } = await this.messagesService.getAll(query.page, query.limit);
    return { data: messages.map((m) => this.messagesService.entityToProto(m)), total };
  }
}
