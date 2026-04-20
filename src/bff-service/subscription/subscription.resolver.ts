import { UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from '@app/auth';
import { SubscriptionClientService } from './subscription.service';
import {
  SelectSubscriptionInput,
  SubscriptionPlanType,
  UserSubscriptionType,
} from './dto/subscription.types';

@Resolver('Subscription')
export class SubscriptionResolver {
  constructor(private readonly subscriptions: SubscriptionClientService) {}

  @Query(() => [SubscriptionPlanType])
  subscriptionPlans(): Promise<SubscriptionPlanType[]> {
    return this.subscriptions.getAllPlans();
  }

  @Query(() => UserSubscriptionType, { nullable: true })
  async mySubscription(@CurrentUserId() userId?: string): Promise<UserSubscriptionType | null> {
    if (!userId) throw new UnauthorizedException();
    return this.subscriptions.getUserSubscription(userId);
  }

  @Mutation(() => UserSubscriptionType)
  async selectSubscription(
    @Args('input') input: SelectSubscriptionInput,
    @CurrentUserId() userId?: string,
  ): Promise<UserSubscriptionType> {
    if (!userId) throw new UnauthorizedException();
    return this.subscriptions.selectSubscription(userId, input.planId);
  }

  @Mutation(() => Boolean)
  async cancelSubscription(@CurrentUserId() userId?: string): Promise<boolean> {
    if (!userId) throw new UnauthorizedException();
    return this.subscriptions.cancelSubscription(userId);
  }
}
