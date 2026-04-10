import { Command } from '@nestjs/cqrs';

export class RemoveCommandCommand extends Command<boolean> {
  constructor(public readonly id: string) {
    super();
  }
}
