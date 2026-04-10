import { Query } from '@nestjs/cqrs';
import { UserResponse } from 'src/proto/user';

export class GetUserByEmailQuery extends Query<UserResponse> {
  constructor(public readonly email: string) {
    super();
  }
}
