import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan, SubscriptionStatus, UserSubscription } from '@app/entities';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly userSubRepo: Repository<UserSubscription>,
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

  async selectPlan(userId: string, planId: string): Promise<UserSubscription & { plan: SubscriptionPlan }> {
    const plan = await this.planRepo.findOne({ where: { id: planId, isActive: true } });
    if (!plan) {
      throw new NotFoundException(`Subscription plan ${planId} not found or inactive`);
    }

    const existing = await this.userSubRepo.findOne({ where: { userId } });
    if (existing) {
      existing.planId = plan.id;
      existing.status = SubscriptionStatus.Active;
      existing.startedAt = new Date();
      existing.expiresAt = null;
      const saved = await this.userSubRepo.save(existing);
      return { ...saved, plan };
    }

    const created = this.userSubRepo.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.Active,
    });
    const saved = await this.userSubRepo.save(created);
    return { ...saved, plan };
  }

  async cancel(userId: string): Promise<void> {
    const existing = await this.userSubRepo.findOne({ where: { userId } });
    if (!existing) return;
    existing.status = SubscriptionStatus.Canceled;
    await this.userSubRepo.save(existing);
  }
}
