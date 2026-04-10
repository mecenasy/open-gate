import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery, { data: UserData[]; total: number }> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetAllUsersQuery): Promise<{ data: UserData[]; total: number }> {
    const { users, total } = await this.userService.findAll(query.page, query.limit);
    return { data: users.map((u) => this.userService.entityToProto(u)), total };
  }
}
