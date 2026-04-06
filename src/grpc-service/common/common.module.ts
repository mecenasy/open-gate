import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { ConfigsModule } from './configs/configs.module';
// import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [PostgresModule, ConfigsModule /*, ProxyModule*/],
})
export class CommonModule {}
