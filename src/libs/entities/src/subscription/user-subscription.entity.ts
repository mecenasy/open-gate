import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

@Entity({ name: 'user_subscriptions', schema: 'shared_config' })
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true, nullable: false })
  userId!: string;

  @Column({ name: 'plan_id', type: 'uuid', nullable: false })
  planId!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    nullable: false,
    default: SubscriptionStatus.Active,
  })
  status!: SubscriptionStatus;

  @Column({
    name: 'started_at',
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  startedAt!: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  expiresAt!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
