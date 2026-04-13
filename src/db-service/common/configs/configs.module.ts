import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { schema } from './config.types';
import { TypeConfigService } from './types.config.service';
import { postgresConfig } from '../postgres/config/postgres.config';
import { config as grpcConfig, schema as grpcConfigSchema } from '@app/db-grpc';
import { envValidationSchema } from 'src/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, grpcConfig],
      validationSchema: envValidationSchema.concat(schema).concat(grpcConfigSchema),
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
