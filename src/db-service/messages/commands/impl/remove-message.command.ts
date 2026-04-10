import { Command } from '@nestjs/cqrs';

export class RemoveMessageCommand extends Command<boolean> {
  constructor(public readonly key: string) {
    super();
  }
}
