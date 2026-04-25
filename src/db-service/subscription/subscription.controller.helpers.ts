import { SubscriptionChangeKind, SubscriptionPlan, UserSubscription } from '@app/entities';
import type { PlanEntry, UserSubscriptionEntry } from 'src/proto/subscription';

const KIND_VALUES = new Set<string>(Object.values(SubscriptionChangeKind));

export function parseKindHint(value: string | null | undefined): SubscriptionChangeKind | null {
  if (!value) return null;
  return KIND_VALUES.has(value) ? (value as SubscriptionChangeKind) : null;
}

export const toPlanEntry = (plan: SubscriptionPlan): PlanEntry => ({
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

export const toSubscriptionEntry = (sub: UserSubscription & { plan: SubscriptionPlan }): UserSubscriptionEntry => ({
  id: sub.id,
  userId: sub.userId,
  planId: sub.planId,
  status: String(sub.status),
  startedAt: sub.startedAt.toISOString(),
  expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : '',
  plan: toPlanEntry(sub.plan),
});
