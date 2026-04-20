import { Module } from '@nestjs/common';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionClientService } from './subscription.service';

@Module({
  providers: [SubscriptionResolver, SubscriptionClientService],
  exports: [SubscriptionClientService],
})
export class SubscriptionBffModule {}
