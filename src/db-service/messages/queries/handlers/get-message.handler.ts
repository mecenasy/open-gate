import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetMessageQuery } from '../impl/get-message.query';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@QueryHandler(GetMessageQuery)
export class GetMessageHandler extends BaseQueryHandler<GetMessageQuery, Message | null> {
  constructor(
    private readonly messagesService: MessagesService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetMessageQuery): Promise<Message | null> {
    return this.run('GetMessage', async () => {
      const entity = await this.messagesService.get(query.key);
      return entity ? this.messagesService.entityToProto(entity) : null;
    });
  }
}
