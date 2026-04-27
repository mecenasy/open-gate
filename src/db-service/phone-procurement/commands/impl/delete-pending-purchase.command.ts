import { Command } from '@nestjs/cqrs';

export class DeletePendingPurchaseCommand extends Command<void> {
  constructor(public readonly pendingId: string) {
    super();
  }
}
