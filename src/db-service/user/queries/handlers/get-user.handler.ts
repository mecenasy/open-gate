import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../impl/get-user.query';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserData | null> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserQuery): Promise<UserData | null> {
    const entity = await this.userService.findById(query.id);
    return entity ? this.userService.entityToProto(entity) : null;
  }
}
