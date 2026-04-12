import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetFeatureConfigQuery } from '../impl/get-feature-config.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetFeatureConfigQuery)
export class GetFeatureConfigHandler implements IQueryHandler<GetFeatureConfigQuery, ConfigProto[]> {
  constructor(
    private readonly configService: CoreConfigService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetFeatureConfigHandler.name);
  }

  async execute(query: GetFeatureConfigQuery): Promise<ConfigProto[]> {
    this.logger.log('Executing GetFeatureConfig');

    try {
      const entities = await this.configService.getConfigsByFeatureKey(query.key);
      return entities.map((e) => this.configService.entityToProto(e));
    } catch (error) {
      this.logger.error('Error executing GetFeatureConfig', error);
      throw error;
    }
  }
}
