import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoreConfigService } from './core-config.service';
import { CONFIG_SERVICE_NAME } from 'src/proto/config';
import type { ConfigServiceController } from 'src/proto/config';

@Controller()
export class CoreConfigController implements ConfigServiceController {
  constructor(private readonly configService: CoreConfigService) {}
  @GrpcMethod(CONFIG_SERVICE_NAME, 'getCoreAll')
  async getCoreAll() {
    const configs = await this.configService.getAllCoreConfigs();
    return {
      status: true,
      message: 'Configs retrieved successfully',
      data: configs.map((config) => this.configService.entityToProto(config)),
    };
  }

  @GrpcMethod(CONFIG_SERVICE_NAME, 'getFeatures')
  async getFeatures() {
    const configs = await this.configService.fetchAllFeatures();
    return {
      status: true,
      message: 'Configs retrieved successfully',
      data: configs.map((config) => this.configService.entityToProto(config)),
    };
  }

  @GrpcMethod(CONFIG_SERVICE_NAME, 'getFeatureConfig')
  async getFeatureConfig(request: { key: string }) {
    const configs = await this.configService.getConfigsByFeatureKey(request.key);
    return {
      status: true,
      message: 'Configs retrieved successfully',
      data: configs.map((config) => this.configService.entityToProto(config)),
    };
  }

  @GrpcMethod(CONFIG_SERVICE_NAME, 'updateConfig')
  async updateConfig(request: { key: string; value: string }) {
    const updatedConfig = await this.configService.updateConfig(request.key, request.value);
    return {
      status: true,
      message: 'Config updated successfully',
      data: this.configService.entityToProto(updatedConfig),
    };
  }
}
