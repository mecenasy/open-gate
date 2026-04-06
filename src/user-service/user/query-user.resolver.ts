import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from './queries/impl/get-user.query';
import { UserType } from './dto/user.type';
import { ExcludeCsrf } from '../common/decorators/csrf.decorator';

@Resolver(() => UserType)
export class QueryUsersResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @ExcludeCsrf()
  @Query(() => UserType, { name: 'user' })
  @ExcludeCsrf()
  async getUser(@Args('id', { type: () => ID }) id: string) {
    return this.queryBus.execute<GetUserQuery, UserType>(new GetUserQuery(id, '', ''));
  }
}
