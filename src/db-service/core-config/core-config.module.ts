import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entity/config.entity';
import { CoreConfigService } from './core-config.service';
import { CoreConfigController } from './core-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  controllers: [CoreConfigController],
  providers: [CoreConfigService],
  exports: [CoreConfigService],
})
export class CoreConfigModule {}
