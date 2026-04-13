import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetFeatureConfigQuery } from '../impl/get-feature-config.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetFeatureConfigQuery)
export class GetFeatureConfigHandler extends BaseQueryHandler<GetFeatureConfigQuery, ConfigProto[]> {
  constructor(
    private readonly configService: CoreConfigService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetFeatureConfigQuery): Promise<ConfigProto[]> {
    return this.run('GetFeatureConfig', async () => {
      const entities = await this.configService.getConfigsByFeatureKey(query.key);
      return entities.map((e) => this.configService.entityToProto(e));
    });
  }
}
