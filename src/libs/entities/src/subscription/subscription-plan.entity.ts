import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionPlanCode } from '../enums/subscription-plan-code.enum';

@Entity({ name: 'subscription_plans', schema: 'shared_config' })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlanCode,
    unique: true,
    nullable: false,
  })
  code!: SubscriptionPlanCode;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string;

  @Column({ name: 'max_tenants', type: 'int', nullable: false })
  maxTenants!: number;

  @Column({ name: 'max_platforms_per_tenant', type: 'int', nullable: false })
  maxPlatformsPerTenant!: number;

  @Column({ name: 'max_contacts_per_tenant', type: 'int', nullable: false })
  maxContactsPerTenant!: number;

  @Column({ name: 'max_staff_per_tenant', type: 'int', nullable: false })
  maxStaffPerTenant!: number;

  @Column({ name: 'max_custom_commands_per_tenant', type: 'int', nullable: false })
  maxCustomCommandsPerTenant!: number;

  @Column({ name: 'price_cents', type: 'int', nullable: false, default: 0 })
  priceCents!: number;

  @Column({ type: 'varchar', length: 3, nullable: false, default: 'EUR' })
  currency!: string;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
  isActive!: boolean;

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
