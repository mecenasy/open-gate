import { Command } from '@nestjs/cqrs';

export class RemovePasskeyCommand extends Command<{ status: boolean }> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {
    super();
  }
}
