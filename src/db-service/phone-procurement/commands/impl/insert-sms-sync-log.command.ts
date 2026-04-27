import { Command } from '@nestjs/cqrs';

export class InsertSmsSyncLogCommand extends Command<void> {
  constructor(
    public readonly tenantId: string,
    public readonly syncDate: string,
    public readonly messagesCounted: number,
  ) {
    super();
  }
}
