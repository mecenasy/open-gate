import { Module } from '@nestjs/common';
import { DbGrpcModule } from '@app/db-grpc';
import { PlatformIdentityDbClient } from './platform-identity-db.client';

@Module({
  imports: [DbGrpcModule],
  providers: [PlatformIdentityDbClient],
  exports: [PlatformIdentityDbClient],
})
export class PlatformIdentityModule {}
