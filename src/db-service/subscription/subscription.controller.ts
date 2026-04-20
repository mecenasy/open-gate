import { Controller } from '@nestjs/common';
import {
  SubscriptionServiceController,
  SubscriptionServiceControllerMethods,
  GetAllPlansRequest,
  GetAllPlansResponse,
  GetPlanByIdRequest,
  GetPlanByIdResponse,
  GetUserSubscriptionRequest,
  GetUserSubscriptionResponse,
  SelectSubscriptionRequest,
  SelectSubscriptionResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  PlanEntry,
  UserSubscriptionEntry,
} from 'src/proto/subscription';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlan, UserSubscription } from '@app/entities';

const toPlanEntry = (plan: SubscriptionPlan): PlanEntry => ({
  id: plan.id,
  code: String(plan.code),
  name: plan.name,
  maxTenants: plan.maxTenants,
  maxPlatformsPerTenant: plan.maxPlatformsPerTenant,
  maxContactsPerTenant: plan.maxContactsPerTenant,
  maxStaffPerTenant: plan.maxStaffPerTenant,
  maxCustomCommandsPerTenant: plan.maxCustomCommandsPerTenant,
  priceCents: plan.priceCents,
  currency: plan.currency,
  isActive: plan.isActive,
});

const toSubscriptionEntry = (sub: UserSubscription & { plan: SubscriptionPlan }): UserSubscriptionEntry => ({
  id: sub.id,
  userId: sub.userId,
  planId: sub.planId,
  status: String(sub.status),
  startedAt: sub.startedAt.toISOString(),
  expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : '',
  plan: toPlanEntry(sub.plan),
});

@Controller()
@SubscriptionServiceControllerMethods()
export class SubscriptionController implements SubscriptionServiceController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async getAllPlans(_req: GetAllPlansRequest): Promise<GetAllPlansResponse> {
    const plans = await this.subscriptionService.findAllPlans();
    return {
      status: true,
      message: 'OK',
      plans: plans.map(toPlanEntry),
    };
  }

  async getPlanById({ planId }: GetPlanByIdRequest): Promise<GetPlanByIdResponse> {
    const plan = await this.subscriptionService.findPlanById(String(planId));
    if (!plan) {
      return { status: false, message: 'Plan not found', plan: undefined };
    }
    return { status: true, message: 'OK', plan: toPlanEntry(plan) };
  }

  async getUserSubscription({ userId }: GetUserSubscriptionRequest): Promise<GetUserSubscriptionResponse> {
    const sub = await this.subscriptionService.findUserSubscriptionWithPlan(String(userId));
    if (!sub) {
      return { status: false, message: 'No subscription', subscription: undefined };
    }
    return { status: true, message: 'OK', subscription: toSubscriptionEntry(sub) };
  }

  async selectSubscription({ userId, planId }: SelectSubscriptionRequest): Promise<SelectSubscriptionResponse> {
    const sub = await this.subscriptionService.selectPlan(String(userId), String(planId));
    return { status: true, message: 'Subscription selected', subscription: toSubscriptionEntry(sub) };
  }

  async cancelSubscription({ userId }: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    await this.subscriptionService.cancel(String(userId));
    return { status: true, message: 'Subscription canceled' };
  }
}
