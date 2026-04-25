import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionChange, SubscriptionPlan, UserSubscription } from '@app/entities';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, SubscriptionChange])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [TypeOrmModule, SubscriptionService],
})
export class SubscriptionModule {}
