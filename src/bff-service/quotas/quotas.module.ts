import { forwardRef, Module } from '@nestjs/common';
import { QuotasClientService } from './quotas.client.service';
import { SubscriptionBffModule } from '../subscription/subscription.module';

@Module({
  imports: [forwardRef(() => SubscriptionBffModule)],
  providers: [QuotasClientService],
  exports: [QuotasClientService],
})
export class QuotasBffModule {}
