import { Command } from '@nestjs/cqrs';

export class RemovePromptCommand extends Command<boolean> {
  constructor(public readonly id: string) {
    super();
  }
}
