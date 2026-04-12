import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetAllMessagesQuery } from '../impl/get-all-messages.query';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@QueryHandler(GetAllMessagesQuery)
export class GetAllMessagesHandler implements IQueryHandler<GetAllMessagesQuery, { data: Message[]; total: number }> {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetAllMessagesHandler.name);
  }

  async execute(query: GetAllMessagesQuery): Promise<{ data: Message[]; total: number }> {
    this.logger.log('Executing GetAllMessages');

    try {
      const { messages, total } = await this.messagesService.getAll(query.page, query.limit);
      return { data: messages.map((m) => this.messagesService.entityToProto(m)), total };
    } catch (error) {
      this.logger.error('Error executing GetAllMessages', error);
      throw error;
    }
  }
}
