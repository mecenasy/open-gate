import { Command } from '@nestjs/cqrs';
import { UpdateUserType } from '../../dto/update-user.type';
import { UserSummaryType } from '../../dto/response.type';

export class UpdateUserCommand extends Command<UserSummaryType> {
  constructor(public readonly user: UpdateUserType) {
    super();
  }
}
