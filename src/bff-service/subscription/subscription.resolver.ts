import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from '@app/auth';
import type { QuotaViolation } from '@app/quotas';
import { CacheService } from '@app/redis';
import { SubscriptionClientService, type PlanChangeKind } from './subscription.service';
import {
  PlanChangePreviewType,
  QuotaViolationType,
  SelectSubscriptionInput,
  SubscriptionChangeType,
  SubscriptionPlanType,
  UserSubscriptionType,
} from './dto/subscription.types';
import { QuotasClientService } from '../quotas/quotas.client.service';

@Resolver('Subscription')
export class SubscriptionResolver {
  constructor(
    private readonly subscriptions: SubscriptionClientService,
    private readonly quotas: QuotasClientService,
    private readonly cache: CacheService,
  ) {}

  @Query(() => [SubscriptionPlanType])
  subscriptionPlans(): Promise<SubscriptionPlanType[]> {
    return this.subscriptions.getAllPlans();
  }

  @Query(() => UserSubscriptionType, { nullable: true })
  async mySubscription(@CurrentUserId() userId?: string): Promise<UserSubscriptionType | null> {
    if (!userId) throw new UnauthorizedException();
    return this.subscriptions.getUserSubscription(userId);
  }

  @Query(() => PlanChangePreviewType)
  async previewPlanChange(
    @Args('newPlanId') newPlanId: string,
    @CurrentUserId() userId?: string,
  ): Promise<PlanChangePreviewType> {
    if (!userId) throw new UnauthorizedException();
    return this.buildPreview(userId, newPlanId);
  }

  @Query(() => [SubscriptionChangeType])
  async subscriptionHistory(@CurrentUserId() userId?: string): Promise<SubscriptionChangeType[]> {
    if (!userId) throw new UnauthorizedException();
    return this.subscriptions.getHistory(userId);
  }

  @Mutation(() => UserSubscriptionType)
  async selectSubscription(
    @Args('input') input: SelectSubscriptionInput,
    @CurrentUserId() userId?: string,
  ): Promise<UserSubscriptionType> {
    if (!userId) throw new UnauthorizedException();

    const preview = await this.buildPreview(userId, input.planId);

    if (preview.kind === 'downgrade' && preview.violations.length > 0) {
      throw new BadRequestException({
        code: 'PLAN_DOWNGRADE_BLOCKED',
        message: `Cannot downgrade to plan "${preview.newPlan.code}": current usage exceeds new limits`,
        violations: preview.violations,
        newPlanCode: preview.newPlan.code,
      });
    }

    const result = await this.subscriptions.selectSubscription(userId, input.planId, {
      kind: preview.kind as PlanChangeKind,
    });
    await this.cache.removeFromCache({ identifier: userId, prefix: 'user-state' });
    return result;
  }

  @Mutation(() => Boolean)
  async cancelSubscription(@CurrentUserId() userId?: string): Promise<boolean> {
    if (!userId) throw new UnauthorizedException();
    const ok = await this.subscriptions.cancelSubscription(userId);
    await this.cache.removeFromCache({ identifier: userId, prefix: 'user-state' });
    return ok;
  }

  private async buildPreview(userId: string, newPlanId: string): Promise<PlanChangePreviewType> {
    const newPlan = await this.subscriptions.getPlanById(newPlanId);
    if (!newPlan) {
      throw new NotFoundException(`Plan ${newPlanId} not found`);
    }

    const currentSub = await this.subscriptions.getUserSubscription(userId);
    const currentPlan = currentSub?.plan ?? null;
    const kind = this.subscriptions.classifyChange(currentPlan, newPlan);

    const violations: QuotaViolation[] =
      kind === 'downgrade' ? await this.quotas.listViolations(userId, newPlan) : [];

    const violationsTyped: QuotaViolationType[] = violations.map((v) => ({
      kind: v.kind,
      tenantId: v.tenantId,
      current: v.current,
      max: v.max,
    }));

    const deltaPriceCents = newPlan.priceCents - (currentPlan?.priceCents ?? 0);

    return {
      newPlan,
      currentPlan: currentPlan ?? undefined,
      kind,
      violations: violationsTyped,
      deltaPriceCents,
    };
  }
}
