import { Query } from '@nestjs/cqrs';
import { UsersListType } from '../../dto/response.type';

export class GetAllUsersQuery extends Query<UsersListType> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    super();
  }
}
