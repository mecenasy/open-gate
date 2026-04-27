import { Command } from '@nestjs/cqrs';

export class IncrementMonthlyMessageCountCommand extends Command<void> {
  constructor(
    public readonly tenantId: string,
    public readonly delta: number,
    public readonly syncedAt: Date,
  ) {
    super();
  }
}
