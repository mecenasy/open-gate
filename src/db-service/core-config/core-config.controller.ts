import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CONFIG_SERVICE_NAME } from 'src/proto/config';
import type { ConfigServiceController, Config as ConfigProto } from 'src/proto/config';
import { UpdateConfigCommand } from './commands/impl/update-config.command';
import { GetCoreAllQuery } from './queries/impl/get-core-all.query';
import { GetFeaturesQuery } from './queries/impl/get-features.query';
import { GetFeatureConfigQuery } from './queries/impl/get-feature-config.query';

@Controller()
export class CoreConfigController implements ConfigServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(CONFIG_SERVICE_NAME, 'getCoreAll')
  async getCoreAll() {
    const data = await this.queryBus.execute<GetCoreAllQuery, ConfigProto[]>(new GetCoreAllQuery());
    return { status: true, message: 'Configs retrieved successfully', data };
  }

  @GrpcMethod(CONFIG_SERVICE_NAME, 'getFeatures')
  async getFeatures() {
    const data = await this.queryBus.execute<GetFeaturesQuery, ConfigProto[]>(new GetFeaturesQuery());
    return { status: true, message: 'Configs retrieved successfully', data };
  }

  @GrpcMethod(CONFIG_SERVICE_NAME, 'getFeatureConfig')
  async getFeatureConfig(request: { key: string }) {
    const data = await this.queryBus.execute<GetFeatureConfigQuery, ConfigProto[]>(
      new GetFeatureConfigQuery(request.key),
    );
    return { status: true, message: 'Configs retrieved successfully', data };
  }

  @GrpcMethod(CONFIG_SERVICE_NAME, 'updateConfig')
  async updateConfig(request: { key: string; value: string }) {
    const data = await this.commandBus.execute<UpdateConfigCommand, ConfigProto>(
      new UpdateConfigCommand(request.key, request.value),
    );
    return { status: true, message: 'Config updated successfully', data };
  }
}
