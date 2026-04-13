import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { UpdateMessageCommand } from '../impl/update-message.command';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@CommandHandler(UpdateMessageCommand)
export class UpdateMessageHandler extends BaseCommandHandler<UpdateMessageCommand, Message | null> {
  constructor(
    private readonly messagesService: MessagesService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpdateMessageCommand): Promise<Message | null> {
    return this.run('UpdateMessage', async () => {
      const entity = await this.messagesService.update(command.key, command.value);
      return entity ? this.messagesService.entityToProto(entity) : null;
    });
  }
}
