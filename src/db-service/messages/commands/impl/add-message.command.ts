import { Command } from '@nestjs/cqrs';
import { Message } from 'src/proto/messages';

export class AddMessageCommand extends Command<Message> {
  constructor(
    public readonly key: string,
    public readonly value: string,
  ) {
    super();
  }
}
