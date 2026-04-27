import { Module } from '@nestjs/common';
import { TenantBffModule } from '../tenant/tenant.module';
import { SubscriptionBffModule } from '../subscription/subscription.module';
import { PhoneProcurementResolver } from './phone-procurement.resolver';
import { PhoneProcurementClientService } from './phone-procurement.client.service';

@Module({
  imports: [TenantBffModule, SubscriptionBffModule],
  providers: [PhoneProcurementResolver, PhoneProcurementClientService],
  exports: [PhoneProcurementClientService],
})
export class PhoneProcurementBffModule {}
