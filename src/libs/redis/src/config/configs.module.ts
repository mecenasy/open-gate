import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { schema } from './config.types';
import { TypeConfigService } from './types.config.service';
import { config } from './redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: schema,
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
  providers: [TypeConfigService],
  exports: [ConfigModule, TypeConfigService],
})
export class ConfigsModule {}
