import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from './config.types';
import { sessionConfig } from './session.config';
import { TypeConfigService } from './types.config.service';
import { appConfig } from './app.configs';
import { schema as dbSchema, config as grpcConfig } from '@app/db-grpc';
import { schema as notifySchema, config as notifyConfig } from '@app/notify-grpc';
import { config as redisConfig, schema as redisSchema } from '@app/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, sessionConfig, redisConfig, grpcConfig, notifyConfig],
      validationSchema: configSchema.concat(dbSchema).concat(notifySchema).concat(redisSchema),
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
  providers: [TypeConfigService],
  exports: [ConfigModule, TypeConfigService],
})
export class ConfigsModule {}
