import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFeatureConfigQuery } from '../impl/get-feature-config.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetFeatureConfigQuery)
export class GetFeatureConfigHandler implements IQueryHandler<GetFeatureConfigQuery, ConfigProto[]> {
  constructor(private readonly configService: CoreConfigService) {}

  async execute(query: GetFeatureConfigQuery): Promise<ConfigProto[]> {
    const entities = await this.configService.getConfigsByFeatureKey(query.key);
    return entities.map((e) => this.configService.entityToProto(e));
  }
}
