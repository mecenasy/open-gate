import { Command } from '@nestjs/cqrs';

export class RemoveUserCommand extends Command<boolean> {
  constructor(public readonly id: string) {
    super();
  }
}
