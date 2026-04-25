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
  GetSubscriptionHistoryRequest,
  GetSubscriptionHistoryResponse,
} from 'src/proto/subscription';
import { SubscriptionService } from './subscription.service';
import { parseKindHint, toPlanEntry, toSubscriptionEntry } from './subscription.controller.helpers';

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

  async selectSubscription({
    userId,
    planId,
    kind,
    correlationId,
  }: SelectSubscriptionRequest): Promise<SelectSubscriptionResponse> {
    const sub = await this.subscriptionService.selectPlan(String(userId), String(planId), {
      kindHint: parseKindHint(kind),
      correlationId: correlationId || null,
    });
    return { status: true, message: 'Subscription selected', subscription: toSubscriptionEntry(sub) };
  }

  async cancelSubscription({ userId, correlationId }: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    await this.subscriptionService.cancel(String(userId), { correlationId: correlationId || null });
    return { status: true, message: 'Subscription canceled' };
  }

  async getSubscriptionHistory({
    userId,
    limit,
  }: GetSubscriptionHistoryRequest): Promise<GetSubscriptionHistoryResponse> {
    const items = await this.subscriptionService.getHistory(String(userId), limit && limit > 0 ? limit : 50);
    return {
      status: true,
      message: 'OK',
      changes: items.map((c) => ({
        id: c.id,
        userId: c.userId,
        oldPlanId: c.oldPlanId ?? '',
        newPlanId: c.newPlanId ?? '',
        kind: String(c.kind),
        initiatedAt: c.initiatedAt.toISOString(),
      })),
    };
  }
}
