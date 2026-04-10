import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Config } from './entity/config.entity';
import { CoreConfigService } from './core-config.service';
import { CoreConfigController } from './core-config.controller';
import { configCommandHandlers } from './commands/handlers';
import { configQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Config]), CqrsModule],
  controllers: [CoreConfigController],
  providers: [CoreConfigService, ...configCommandHandlers, ...configQueryHandlers],
  exports: [CoreConfigService],
})
export class CoreConfigModule {}
