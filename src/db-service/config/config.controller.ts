import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConfigService } from './config.service';
import { Config } from '../common/entity/config.entity';

@Controller()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @GrpcMethod('ConfigService', 'Add')
  async add(request: {
    key: string;
    value: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; data?: Config }> {
    try {
      const config = await this.configService.add({
        key: request.key,
        value: request.value,
        description: request.description,
      });

      return {
        success: true,
        message: 'Config added successfully',
        data: config,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add config: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod('ConfigService', 'Remove')
  async remove(request: { key: string }): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.configService.remove(request);
      if (success) {
        return {
          success: true,
          message: 'Config removed successfully',
        };
      } else {
        return {
          success: false,
          message: 'Config not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to remove config: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod('ConfigService', 'GetByKey')
  async getByKey(request: { key: string }): Promise<{ success: boolean; message: string; data?: Config }> {
    try {
      const config = await this.configService.getByKey(request);
      if (config) {
        return {
          success: true,
          message: 'Config found',
          data: config,
        };
      } else {
        return {
          success: false,
          message: 'Config not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to get config: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod('ConfigService', 'GetAll')
  async getAll(): Promise<{ success: boolean; message: string; data: Config[] }> {
    try {
      const configs = await this.configService.getAll();
      return {
        success: true,
        message: 'Configs retrieved successfully',
        data: configs,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get configs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
      };
    }
  }
}
