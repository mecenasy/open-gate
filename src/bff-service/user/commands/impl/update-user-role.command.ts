import { Command } from '@nestjs/cqrs';
import { UpdateUserRoleType } from '../../dto/update-user-role.type';
import { UserSummaryType } from '../../dto/response.type';

export class UpdateUserRoleCommand extends Command<UserSummaryType> {
  constructor(public readonly input: UpdateUserRoleType) {
    super();
  }
}
