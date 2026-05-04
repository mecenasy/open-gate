import { Command } from '@nestjs/cqrs';

export class MarkExpiredBindingsCommand extends Command<number> {
  constructor(public readonly limit: number) {
    super();
  }
}
