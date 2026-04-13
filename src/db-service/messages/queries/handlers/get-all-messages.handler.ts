import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetAllMessagesQuery } from '../impl/get-all-messages.query';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@QueryHandler(GetAllMessagesQuery)
export class GetAllMessagesHandler extends BaseQueryHandler<GetAllMessagesQuery, { data: Message[]; total: number }> {
  constructor(
    private readonly messagesService: MessagesService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetAllMessagesQuery): Promise<{ data: Message[]; total: number }> {
    return this.run('GetAllMessages', async () => {
      const { messages, total } = await this.messagesService.getAll(query.page, query.limit);
      return { data: messages.map((m) => this.messagesService.entityToProto(m)), total };
    });
  }
}
