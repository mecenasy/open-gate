import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entity/tenant.entity';
import { CustomizationConfig } from './entity/customization-config.entity';
import { TenantDbService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, CustomizationConfig])],
  providers: [TenantDbService],
  exports: [TypeOrmModule, TenantDbService],
})
export class TenantDbModule {}
