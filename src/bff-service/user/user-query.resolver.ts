import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllUsersQuery } from './queries/impl/get-all-users.query';
import { GetUserByIdQuery } from './queries/impl/get-user-by-id.query';
import { UserSummaryType, UsersListType } from './dto/response.type';
import { GetAllUsersType } from './dto/get-all-users.type';
import { GetUserType } from './dto/get-user.type';

@Resolver('User')
export class UserQueryResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => UsersListType)
  async users(@Args('input', { nullable: true }) input?: GetAllUsersType) {
    return this.queryBus.execute<GetAllUsersQuery, UsersListType>(
      new GetAllUsersQuery(input?.page ?? 1, input?.limit ?? 10),
    );
  }

  @Query(() => UserSummaryType)
  async user(@Args('input') input: GetUserType) {
    return this.queryBus.execute<GetUserByIdQuery, UserSummaryType>(new GetUserByIdQuery(input.id));
  }
}
