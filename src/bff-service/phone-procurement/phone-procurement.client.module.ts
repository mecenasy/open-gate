import { Module } from '@nestjs/common';
import { PhoneProcurementClientService } from './phone-procurement.client.service';

// Slim wrapper around PhoneProcurementClientService so it can be imported
// by both the resolver module and the tenant module without forming a
// cycle (TenantBffModule ↔ PhoneProcurementBffModule).
@Module({
  providers: [PhoneProcurementClientService],
  exports: [PhoneProcurementClientService],
})
export class PhoneProcurementClientModule {}
