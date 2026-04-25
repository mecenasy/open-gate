import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionClientService } from './subscription.service';
import { QuotasBffModule } from '../quotas/quotas.module';

@Module({
  imports: [forwardRef(() => QuotasBffModule)],
  providers: [SubscriptionResolver, SubscriptionClientService],
  exports: [SubscriptionClientService],
})
export class SubscriptionBffModule {}
