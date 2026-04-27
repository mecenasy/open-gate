import { Command } from '@nestjs/cqrs';

export class ResetAllMonthlyMessageCountsCommand extends Command<void> {}
