import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from '../impl/get-user-by-email.query';
import { UserService } from '../../user.service';
import { UserResponse } from 'src/proto/user';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery, UserResponse> {
  constructor(private readonly userService: UserService) {}

  execute(query: GetUserByEmailQuery): Promise<UserResponse> {
    return this.userService.findUserByEmail(query.email);
  }
}
