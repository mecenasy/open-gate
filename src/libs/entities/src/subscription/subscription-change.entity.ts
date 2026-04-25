import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionChangeKind } from '../enums/subscription-change-kind.enum';

@Entity({ name: 'subscription_changes', schema: 'shared_config' })
@Index('IDX_subscription_changes_user_initiated', ['userId', 'initiatedAt'])
export class SubscriptionChange {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @Column({ name: 'old_plan_id', type: 'uuid', nullable: true })
  oldPlanId!: string | null;

  @Column({ name: 'new_plan_id', type: 'uuid', nullable: true })
  newPlanId!: string | null;

  @Column({
    type: 'enum',
    enum: SubscriptionChangeKind,
    enumName: 'subscription_change_kind',
    nullable: false,
  })
  kind!: SubscriptionChangeKind;

  @Column({ name: 'violations_json', type: 'jsonb', nullable: true })
  violationsJson!: Record<string, unknown> | null;

  @Column({ name: 'correlation_id', type: 'varchar', length: 64, nullable: true })
  correlationId!: string | null;

  @CreateDateColumn({
    name: 'initiated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  initiatedAt!: Date;
}
