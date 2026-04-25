import { forwardRef, Module } from '@nestjs/common';
import { QuotasClientService } from './quotas.client.service';
import { QuotasResolver } from './quotas.resolver';
import { SubscriptionBffModule } from '../subscription/subscription.module';

@Module({
  imports: [forwardRef(() => SubscriptionBffModule)],
  providers: [QuotasClientService, QuotasResolver],
  exports: [QuotasClientService],
})
export class QuotasBffModule {}
