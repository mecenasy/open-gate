import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCoreAllQuery } from '../impl/get-core-all.query';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@QueryHandler(GetCoreAllQuery)
export class GetCoreAllHandler implements IQueryHandler<GetCoreAllQuery, ConfigProto[]> {
  constructor(private readonly configService: CoreConfigService) {}

  async execute(): Promise<ConfigProto[]> {
    const entities = await this.configService.getAllCoreConfigs();
    return entities.map((e) => this.configService.entityToProto(e));
  }
}
