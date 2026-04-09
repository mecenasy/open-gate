import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetFeatureConfigType } from './dto/get-feature-config.type';
import { ConfigsListType } from './dto/response.type';
import { GetCoreAllQuery } from './queries/impl/get-core-all.query';
import { GetFeaturesQuery } from './queries/impl/get-features.query';
import { GetFeatureConfigQuery } from './queries/impl/get-feature-config.query';
import { Owner } from '../common/decorators/owner.decorator';

@Resolver('CoreConfig')
export class CoreConfigQueryResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Owner()
  @Query(() => ConfigsListType)
  async coreConfigs(): Promise<ConfigsListType> {
    return this.queryBus.execute<GetCoreAllQuery, ConfigsListType>(new GetCoreAllQuery());
  }

  @Query(() => ConfigsListType)
  async featureConfigs(): Promise<ConfigsListType> {
    return this.queryBus.execute<GetFeaturesQuery, ConfigsListType>(new GetFeaturesQuery());
  }

  @Query(() => ConfigsListType)
  async featureConfig(@Args('input') input: GetFeatureConfigType): Promise<ConfigsListType> {
    return this.queryBus.execute<GetFeatureConfigQuery, ConfigsListType>(new GetFeatureConfigQuery(input.key));
  }
}
