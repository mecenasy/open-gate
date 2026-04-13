import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamicDataSourceProvider } from './dynamic-data-source.provider';
import { TenantSchemaManager } from './tenant-schema.manager';

@Module({
  imports: [ConfigModule],
  providers: [DynamicDataSourceProvider, TenantSchemaManager],
  exports: [DynamicDataSourceProvider, TenantSchemaManager],
})
export class DatabaseModule {}
