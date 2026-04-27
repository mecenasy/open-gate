import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Numbers bought on the master account that haven't been bound to a tenant
 * yet. Once `attachedToTenantId` is set, the row is "claimed" and a
 * matching record exists in `tenant_phone_numbers`. Unclaimed rows older
 * than the safety window are released by the hourly cron.
 */
@Entity({ name: 'pending_phone_purchases', schema: 'shared_config' })
@Index('IDX_pending_phone_purchases_owner', ['ownerUserId'])
export class PendingPhonePurchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: false })
  ownerUserId!: string;

  @Column({ name: 'provider_key', type: 'varchar', length: 40, nullable: false })
  providerKey!: string;

  @Column({ name: 'provider_external_id', type: 'varchar', length: 100, nullable: false })
  providerExternalId!: string;

  @Column({ name: 'phone_e164', type: 'varchar', length: 20, nullable: false })
  phoneE164!: string;

  @Column({ name: 'attached_to_tenant_id', type: 'uuid', nullable: true })
  attachedToTenantId!: string | null;

  @Column({
    name: 'purchased_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  purchasedAt!: Date;

  @Column({ name: 'attached_at', type: 'timestamptz', nullable: true })
  attachedAt!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt!: Date;
}
