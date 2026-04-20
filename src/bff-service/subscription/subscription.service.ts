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
import type { SubscriptionPlanType, UserSubscriptionType } from './dto/subscription.types';

const toPlan = (p: PlanEntry): SubscriptionPlanType => ({
  id: p.id,
  code: p.code,
  name: p.name,
  maxTenants: p.maxTenants,
  maxPlatformsPerTenant: p.maxPlatformsPerTenant,
  maxContactsPerTenant: p.maxContactsPerTenant,
  maxStaffPerTenant: p.maxStaffPerTenant,
  maxCustomCommandsPerTenant: p.maxCustomCommandsPerTenant,
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

  async selectSubscription(userId: string, planId: string): Promise<UserSubscriptionType> {
    const res = await lastValueFrom(this.grpc.selectSubscription({ userId, planId }));
    if (!res.status || !res.subscription) {
      throw new NotFoundException(res.message || 'Failed to select subscription');
    }
    return toSubscription(res.subscription);
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    const res = await lastValueFrom(this.grpc.cancelSubscription({ userId }));
    return res.status;
  }

  async getLimitsForUser(userId: string): Promise<SubscriptionPlanType | null> {
    const sub = await this.getUserSubscription(userId);
    return sub?.plan ?? null;
  }
}
