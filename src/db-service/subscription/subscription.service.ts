import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import {
  SubscriptionChange,
  SubscriptionChangeKind,
  SubscriptionPlan,
  SubscriptionStatus,
  UserSubscription,
} from '@app/entities';
import { BILLING_PROVIDER_TOKEN, type BillingProvider } from '@app/billing';

interface RecordChangeInput {
  userId: string;
  oldPlanId: string | null;
  newPlanId: string | null;
  kind: SubscriptionChangeKind;
  violationsJson?: Record<string, unknown> | null;
  correlationId?: string | null;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly userSubRepo: Repository<UserSubscription>,
    @InjectRepository(SubscriptionChange)
    private readonly changesRepo: Repository<SubscriptionChange>,
    @Inject(BILLING_PROVIDER_TOKEN)
    private readonly billing: BillingProvider,
  ) {}

  findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({ where: { isActive: true }, order: { priceCents: 'ASC' } });
  }

  findPlanById(id: string): Promise<SubscriptionPlan | null> {
    return this.planRepo.findOne({ where: { id } });
  }

  async findUserSubscriptionWithPlan(userId: string): Promise<(UserSubscription & { plan: SubscriptionPlan }) | null> {
    const sub = await this.userSubRepo.findOne({ where: { userId } });
    if (!sub) return null;
    const plan = await this.planRepo.findOne({ where: { id: sub.planId } });
    if (!plan) return null;
    return { ...sub, plan };
  }

  async selectPlan(
    userId: string,
    planId: string,
    options: { kindHint?: SubscriptionChangeKind | null; correlationId?: string | null } = {},
  ): Promise<UserSubscription & { plan: SubscriptionPlan }> {
    const plan = await this.planRepo.findOne({ where: { id: planId, isActive: true } });
    if (!plan) {
      throw new NotFoundException(`Subscription plan ${planId} not found or inactive`);
    }

    const existing = await this.userSubRepo.findOne({ where: { userId } });
    const oldPlanId = existing?.planId ?? null;
    const oldPlan = oldPlanId ? await this.planRepo.findOne({ where: { id: oldPlanId } }) : null;

    const kind = oldPlanId === null ? SubscriptionChangeKind.Initial : (options.kindHint ?? SubscriptionChangeKind.Upgrade);

    // Hand off to the billing provider before writing local state. With
    // NoopBillingProvider this is a no-op; with Stripe the prorated charge
    // happens here and we persist whatever externalSubscriptionId / period
    // window the provider hands back.
    const billingResult = await this.billing.applyChange({
      userId,
      externalSubscriptionId: existing?.externalSubscriptionId ?? null,
      fromPlan: oldPlan
        ? { id: oldPlan.id, code: String(oldPlan.code), priceCents: oldPlan.priceCents, currency: oldPlan.currency }
        : null,
      toPlan: { id: plan.id, code: String(plan.code), priceCents: plan.priceCents, currency: plan.currency },
    });

    if (existing) {
      existing.planId = plan.id;
      existing.status = SubscriptionStatus.Active;
      existing.startedAt = new Date();
      existing.expiresAt = null;
      existing.externalSubscriptionId = billingResult.externalSubscriptionId;
      existing.cancelAtPeriodEnd = false;
      existing.currentPeriodEnd = billingResult.currentPeriodEnd;
      const saved = await this.userSubRepo.save(existing);
      await this.recordChange({
        userId,
        oldPlanId,
        newPlanId: plan.id,
        kind,
        correlationId: options.correlationId,
      });
      return { ...saved, plan };
    }

    const created = this.userSubRepo.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.Active,
      externalSubscriptionId: billingResult.externalSubscriptionId,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: billingResult.currentPeriodEnd,
    });
    const saved = await this.userSubRepo.save(created);
    await this.recordChange({
      userId,
      oldPlanId: null,
      newPlanId: plan.id,
      kind: SubscriptionChangeKind.Initial,
      correlationId: options.correlationId,
    });
    return { ...saved, plan };
  }

  async cancel(
    userId: string,
    options: { atPeriodEnd?: boolean; correlationId?: string | null } = {},
  ): Promise<void> {
    const existing = await this.userSubRepo.findOne({ where: { userId } });
    if (!existing) return;
    const oldPlanId = existing.planId;
    const atPeriodEnd = options.atPeriodEnd ?? false;

    const cancelResult = await this.billing.cancel({
      userId,
      externalSubscriptionId: existing.externalSubscriptionId,
      atPeriodEnd,
    });

    if (atPeriodEnd && cancelResult.effectiveAt) {
      existing.status = SubscriptionStatus.ScheduledCancellation;
      existing.cancelAtPeriodEnd = true;
      existing.currentPeriodEnd = cancelResult.effectiveAt;
    } else {
      existing.status = SubscriptionStatus.Canceled;
      existing.cancelAtPeriodEnd = false;
    }

    await this.userSubRepo.save(existing);
    await this.recordChange({
      userId,
      oldPlanId,
      newPlanId: null,
      kind: SubscriptionChangeKind.Cancel,
      correlationId: options.correlationId,
    });
  }

  /**
   * Promotes ScheduledCancellation → Canceled for subscriptions whose
   * currentPeriodEnd has passed. Intended to be invoked by a periodic
   * job (cron / lambda) — runs idempotently in batches.
   */
  async finalizeScheduledCancellations(now: Date = new Date()): Promise<number> {
    const due = await this.userSubRepo.find({
      where: {
        status: SubscriptionStatus.ScheduledCancellation,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: LessThanOrEqual(now),
      },
    });
    if (due.length === 0) return 0;

    for (const sub of due) {
      sub.status = SubscriptionStatus.Canceled;
      sub.cancelAtPeriodEnd = false;
    }
    await this.userSubRepo.save(due);
    return due.length;
  }

  async getHistory(userId: string, limit = 50): Promise<SubscriptionChange[]> {
    return this.changesRepo.find({
      where: { userId },
      order: { initiatedAt: 'DESC' },
      take: limit,
    });
  }

  async recordChange(input: RecordChangeInput): Promise<SubscriptionChange> {
    return this.changesRepo.save(
      this.changesRepo.create({
        userId: input.userId,
        oldPlanId: input.oldPlanId,
        newPlanId: input.newPlanId,
        kind: input.kind,
        violationsJson: input.violationsJson ?? null,
        correlationId: input.correlationId ?? null,
      }),
    );
  }

}
