import { Command } from '@nestjs/cqrs';

export class CommandProcessCommand extends Command<any> {
  constructor() {
    super();
  }
}
