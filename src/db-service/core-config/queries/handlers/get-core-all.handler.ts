import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetCoreAllQuery } from '../impl/get-core-all.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetCoreAllQuery)
export class GetCoreAllHandler extends BaseQueryHandler<GetCoreAllQuery, ConfigProto[]> {
  constructor(
    private readonly configService: CoreConfigService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(): Promise<ConfigProto[]> {
    return this.run('GetCoreAll', async () => {
      const entities = await this.configService.getAllCoreConfigs();
      return entities.map((e) => this.configService.entityToProto(e));
    });
  }
}
