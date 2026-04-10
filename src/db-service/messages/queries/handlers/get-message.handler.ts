import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMessageQuery } from '../impl/get-message.query';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@QueryHandler(GetMessageQuery)
export class GetMessageHandler implements IQueryHandler<GetMessageQuery, Message | null> {
  constructor(private readonly messagesService: MessagesService) {}

  async execute(query: GetMessageQuery): Promise<Message | null> {
    const entity = await this.messagesService.get(query.key);
    return entity ? this.messagesService.entityToProto(entity) : null;
  }
}
