import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeConfigService } from '../configs/types.config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypeConfigService) => ({
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        ...configService.get('db'),
        autoLoadEntities: true,
        synchronize: false,
        logging: ['schema'],
      }),
    }),
  ],
  providers: [
    TypeConfigService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [TypeOrmModule],
})
export class PostgresModule {}
