import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import {
  PlanEntry,
  SUBSCRIPTION_SERVICE_NAME,
  SubscriptionServiceClient,
  UserSubscriptionEntry,
} from 'src/proto/subscription';
import type { SubscriptionChangeType, SubscriptionPlanType, UserSubscriptionType } from './dto/subscription.types';

const toPlan = (p: PlanEntry): SubscriptionPlanType => ({
  id: p.id,
  code: p.code,
  name: p.name,
  maxTenants: p.maxTenants,
  maxPlatformsPerTenant: p.maxPlatformsPerTenant,
  maxContactsPerTenant: p.maxContactsPerTenant,
  maxStaffPerTenant: p.maxStaffPerTenant,
  maxCustomCommandsPerTenant: p.maxCustomCommandsPerTenant,
  phoneNumbersIncluded: p.phoneNumbersIncluded,
  messagesPerMonthIncluded: p.messagesPerMonthIncluded,
  pricePerExtraMessageCents: p.pricePerExtraMessageCents,
  phoneMonthlyCostCents: p.phoneMonthlyCostCents,
  priceCents: p.priceCents,
  currency: p.currency,
  isActive: p.isActive,
});

const toSubscription = (s: UserSubscriptionEntry): UserSubscriptionType => ({
  id: s.id,
  planId: s.planId,
  status: s.status,
  startedAt: s.startedAt,
  expiresAt: s.expiresAt || undefined,
  plan: toPlan(s.plan!),
});

export type PlanChangeKind = 'initial' | 'upgrade' | 'downgrade' | 'same';

@Injectable()
export class SubscriptionClientService implements OnModuleInit {
  private grpc!: SubscriptionServiceClient;

  constructor(@Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.grpc = this.grpcClient.getService<SubscriptionServiceClient>(SUBSCRIPTION_SERVICE_NAME);
  }

  async getAllPlans(): Promise<SubscriptionPlanType[]> {
    const res = await lastValueFrom(this.grpc.getAllPlans({}));
    return res.plans.map(toPlan);
  }

  async getPlanById(planId: string): Promise<SubscriptionPlanType | null> {
    const res = await lastValueFrom(this.grpc.getPlanById({ planId }));
    if (!res.status || !res.plan) return null;
    return toPlan(res.plan);
  }

  async getUserSubscription(userId: string): Promise<UserSubscriptionType | null> {
    const res = await lastValueFrom(this.grpc.getUserSubscription({ userId }));
    if (!res.status || !res.subscription) return null;
    return toSubscription(res.subscription);
  }

  async selectSubscription(
    userId: string,
    planId: string,
    options: { kind?: PlanChangeKind; correlationId?: string } = {},
  ): Promise<UserSubscriptionType> {
    const res = await lastValueFrom(
      this.grpc.selectSubscription({
        userId,
        planId,
        kind: options.kind ?? '',
        correlationId: options.correlationId ?? '',
      }),
    );
    if (!res.status || !res.subscription) {
      throw new NotFoundException(res.message || 'Failed to select subscription');
    }
    return toSubscription(res.subscription);
  }

  async cancelSubscription(userId: string, correlationId?: string): Promise<boolean> {
    const res = await lastValueFrom(this.grpc.cancelSubscription({ userId, correlationId: correlationId ?? '' }));
    return res.status;
  }

  async getLimitsForUser(userId: string): Promise<SubscriptionPlanType | null> {
    const sub = await this.getUserSubscription(userId);
    return sub?.plan ?? null;
  }

  async getHistory(userId: string, limit = 50): Promise<SubscriptionChangeType[]> {
    const res = await lastValueFrom(this.grpc.getSubscriptionHistory({ userId, limit }));
    return (res.changes ?? []).map((c) => ({
      id: c.id,
      oldPlanId: c.oldPlanId || undefined,
      newPlanId: c.newPlanId || undefined,
      kind: c.kind,
      initiatedAt: c.initiatedAt,
    }));
  }

  /**
   * Compares plan limits across all bounded resources. A plan is a downgrade
   * if any per-resource cap shrinks; an upgrade if at least one grows and
   * none shrinks; otherwise 'same'. Initial selection is signalled by
   * caller (no current subscription).
   */
  classifyChange(currentPlan: SubscriptionPlanType | null, newPlan: SubscriptionPlanType): PlanChangeKind {
    if (!currentPlan) return 'initial';
    if (currentPlan.id === newPlan.id) return 'same';

    const fields: Array<
      keyof Pick<
        SubscriptionPlanType,
        | 'maxTenants'
        | 'maxPlatformsPerTenant'
        | 'maxContactsPerTenant'
        | 'maxStaffPerTenant'
        | 'maxCustomCommandsPerTenant'
      >
    > = [
      'maxTenants',
      'maxPlatformsPerTenant',
      'maxContactsPerTenant',
      'maxStaffPerTenant',
      'maxCustomCommandsPerTenant',
    ];

    let anyShrinks = false;
    let anyGrows = false;
    for (const field of fields) {
      if (newPlan[field] < currentPlan[field]) anyShrinks = true;
      else if (newPlan[field] > currentPlan[field]) anyGrows = true;
    }

    if (anyShrinks) return 'downgrade';
    if (anyGrows) return 'upgrade';
    return 'same';
  }
}
