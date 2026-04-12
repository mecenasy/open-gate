import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetCoreAllQuery } from '../impl/get-core-all.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetCoreAllQuery)
export class GetCoreAllHandler implements IQueryHandler<GetCoreAllQuery, ConfigProto[]> {
  constructor(
    private readonly configService: CoreConfigService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetCoreAllHandler.name);
  }

  async execute(): Promise<ConfigProto[]> {
    this.logger.log('Executing GetCoreAll');

    try {
      const entities = await this.configService.getAllCoreConfigs();
      return entities.map((e) => this.configService.entityToProto(e));
    } catch (error) {
      this.logger.error('Error executing GetCoreAll', error);
      throw error;
    }
  }
}
