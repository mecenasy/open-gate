import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFeaturesQuery } from '../impl/get-features.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetFeaturesQuery)
export class GetFeaturesHandler implements IQueryHandler<GetFeaturesQuery, ConfigProto[]> {
  constructor(private readonly configService: CoreConfigService) {}

  async execute(): Promise<ConfigProto[]> {
    const entities = await this.configService.fetchAllFeatures();
    return entities.map((e) => this.configService.entityToProto(e));
  }
}
