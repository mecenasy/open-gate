import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { RemoveMessageCommand } from '../impl/remove-message.command';
import { MessagesService } from '../../messages.service';

@CommandHandler(RemoveMessageCommand)
export class RemoveMessageHandler extends BaseCommandHandler<RemoveMessageCommand, boolean> {
  constructor(
    private readonly messagesService: MessagesService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: RemoveMessageCommand): Promise<boolean> {
    return this.run('RemoveMessage', () => this.messagesService.remove(command.key));
  }
}
