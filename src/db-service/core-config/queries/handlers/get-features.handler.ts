import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetFeaturesQuery } from '../impl/get-features.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetFeaturesQuery)
export class GetFeaturesHandler implements IQueryHandler<GetFeaturesQuery, ConfigProto[]> {
  constructor(
    private readonly configService: CoreConfigService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetFeaturesHandler.name);
  }

  async execute(): Promise<ConfigProto[]> {
    this.logger.log('Executing GetFeatures');

    try {
      const entities = await this.configService.fetchAllFeatures();
      return entities.map((e) => this.configService.entityToProto(e));
    } catch (error) {
      this.logger.error('Error executing GetFeatures', error);
      throw error;
    }
  }
}
