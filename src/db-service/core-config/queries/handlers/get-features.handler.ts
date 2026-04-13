import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetFeaturesQuery } from '../impl/get-features.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetFeaturesQuery)
export class GetFeaturesHandler extends BaseQueryHandler<GetFeaturesQuery, ConfigProto[]> {
  constructor(
    private readonly configService: CoreConfigService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(): Promise<ConfigProto[]> {
    return this.run('GetFeatures', async () => {
      const entities = await this.configService.fetchAllFeatures();
      return entities.map((e) => this.configService.entityToProto(e));
    });
  }
}
