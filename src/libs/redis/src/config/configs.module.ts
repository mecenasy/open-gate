import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { schema } from './config.types';
import { TypeConfigService } from './types.config.service';
import { config } from './redis.config';
import { envValidationSchema } from 'src/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envValidationSchema.concat(schema),
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
