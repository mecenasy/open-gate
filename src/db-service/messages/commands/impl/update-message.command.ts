import { Command } from '@nestjs/cqrs';
import { Message } from 'src/proto/messages';

export class UpdateMessageCommand extends Command<Message | null> {
  constructor(
    public readonly key: string,
    public readonly value: string,
  ) {
    super();
  }
}
