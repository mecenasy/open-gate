import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from './config.types';
import { TypeConfigService } from './types.config.service';
import { appConfig } from './app.configs';
import { config as redisConfig, schema as redisSchema } from '@app/redis';
import { config as dbConfig, schema as dbSchema } from '@app/db-grpc';
import { config as notifyGrpcConfig } from '@app/notify-grpc';
import { config as gateGrpcConfig } from '@app/gate-grpc';
import { envValidationSchema } from 'src/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, redisConfig, dbConfig, notifyGrpcConfig, gateGrpcConfig],
      validationSchema: envValidationSchema.concat(configSchema).concat(redisSchema).concat(dbSchema),
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  providers: [TypeConfigService],
  exports: [ConfigModule, TypeConfigService],
})
export class ConfigsModule {}
