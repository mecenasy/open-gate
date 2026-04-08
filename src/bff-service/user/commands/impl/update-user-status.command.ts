import { Command } from '@nestjs/cqrs';
import { UpdateUserStatusType } from '../../dto/update-user-status.type';
import { UserSummaryType } from '../../dto/response.type';

export class UpdateUserStatusCommand extends Command<UserSummaryType> {
  constructor(public readonly input: UpdateUserStatusType) {
    super();
  }
}
