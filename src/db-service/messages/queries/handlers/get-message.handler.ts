import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetMessageQuery } from '../impl/get-message.query';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@QueryHandler(GetMessageQuery)
export class GetMessageHandler implements IQueryHandler<GetMessageQuery, Message | null> {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetMessageHandler.name);
  }

  async execute(query: GetMessageQuery): Promise<Message | null> {
    this.logger.log('Executing GetMessage');

    try {
      const entity = await this.messagesService.get(query.key);
      return entity ? this.messagesService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetMessage', error);
      throw error;
    }
  }
}
