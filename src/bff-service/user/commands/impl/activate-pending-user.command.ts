import { Command } from '@nestjs/cqrs';
import { UserSummaryType } from '../../dto/response.type';

export class ActivatePendingUserCommand extends Command<UserSummaryType> {
  constructor(
    public readonly userId: string,
    public readonly callerUserId: string,
  ) {
    super();
  }
}
