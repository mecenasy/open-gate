import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { ConfigsModule } from './configs/configs.module';
import { LoggerModule } from '@app/logger';
// import { GateGrpcModule } from '@app/db-grpc';

@Module({
  imports: [PostgresModule, ConfigsModule, LoggerModule /*GateGrpcModule*/],
})
export class CommonModule {}
