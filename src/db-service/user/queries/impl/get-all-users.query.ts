import { Query } from '@nestjs/cqrs';
import { UserData } from 'src/proto/user';

export class GetAllUsersQuery extends Query<{ data: UserData[]; total: number }> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    super();
  }
}
