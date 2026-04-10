import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { ConfigsModule } from './configs/configs.module';
// import { GateGrpcModule } from '@app/db-grpc';

@Module({
  imports: [PostgresModule, ConfigsModule /*GateGrpcModule*/],
})
export class CommonModule {}
