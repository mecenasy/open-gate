import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscriptionChange,
  SubscriptionChangeKind,
  SubscriptionPlan,
  SubscriptionStatus,
  UserSubscription,
} from '@app/entities';

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

    const kind = oldPlanId === null ? SubscriptionChangeKind.Initial : (options.kindHint ?? SubscriptionChangeKind.Upgrade);

    if (existing) {
      existing.planId = plan.id;
      existing.status = SubscriptionStatus.Active;
      existing.startedAt = new Date();
      existing.expiresAt = null;
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

  async cancel(userId: string, correlationId?: string | null): Promise<void> {
    const existing = await this.userSubRepo.findOne({ where: { userId } });
    if (!existing) return;
    const oldPlanId = existing.planId;
    existing.status = SubscriptionStatus.Canceled;
    await this.userSubRepo.save(existing);
    await this.recordChange({
      userId,
      oldPlanId,
      newPlanId: null,
      kind: SubscriptionChangeKind.Cancel,
      correlationId,
    });
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
