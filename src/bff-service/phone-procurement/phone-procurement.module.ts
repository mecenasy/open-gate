import { Module } from '@nestjs/common';
import { TenantBffModule } from '../tenant/tenant.module';
import { SubscriptionBffModule } from '../subscription/subscription.module';
import { PhoneProcurementResolver } from './phone-procurement.resolver';
import { PhoneProcurementClientModule } from './phone-procurement.client.module';

@Module({
  imports: [TenantBffModule, SubscriptionBffModule, PhoneProcurementClientModule],
  providers: [PhoneProcurementResolver],
  exports: [PhoneProcurementClientModule],
})
export class PhoneProcurementBffModule {}
