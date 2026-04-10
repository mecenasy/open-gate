import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CheckExistQuery } from '../impl/check-exist.query';
import { UserService } from '../../user.service';

@QueryHandler(CheckExistQuery)
export class CheckExistHandler implements IQueryHandler<CheckExistQuery, boolean> {
  constructor(private readonly userService: UserService) {}

  async execute(query: CheckExistQuery): Promise<boolean> {
    return !!(await this.userService.findUser(query.email));
  }
}
