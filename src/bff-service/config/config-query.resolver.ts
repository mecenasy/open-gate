import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetByKeyType } from './dto/get-by-key.type';
import { ConfigResponseType, ConfigsListType } from './dto/response.type';
import { GetByKeyQuery } from './queries/impl/get-by-key.query';
import { GetAllConfigsQuery } from './queries/impl/get-all-configs.query';

@Resolver('Config')
export class ConfigQueryResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => ConfigResponseType)
  async config(@Args('input') input: GetByKeyType): Promise<ConfigResponseType> {
    return this.queryBus.execute<GetByKeyQuery, ConfigResponseType>(new GetByKeyQuery(input.key));
  }

  @Query(() => ConfigsListType)
  async configs(): Promise<ConfigsListType> {
    return this.queryBus.execute<GetAllConfigsQuery, ConfigsListType>(new GetAllConfigsQuery());
  }
}
