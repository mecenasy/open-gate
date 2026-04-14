import { Module } from '@nestjs/common';
import { PlatformConfigService } from './platform-config.service';
import { DbGrpcModule } from '@app/db-grpc';
import { RedisModule } from '@app/redis';

@Module({
  imports: [DbGrpcModule, RedisModule],
  providers: [PlatformConfigService],
  exports: [PlatformConfigService],
})
export class PlatformConfigModule {}
