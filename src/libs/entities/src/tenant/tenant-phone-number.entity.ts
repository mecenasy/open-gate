import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PhoneProvisionedBy } from '../enums/phone-provisioned-by.enum';

/**
 * Provider-agnostic registry of phone numbers procured for tenants.
 * For `provisioned_by = 'managed'` the master account (Twilio or other)
 * owns the number and bills us; for `'self'` the tenant brings their own
 * credentials and we just track the mapping.
 */
@Entity({ name: 'tenant_phone_numbers', schema: 'shared_config' })
@Index('IDX_tenant_phone_numbers_tenant_id', ['tenantId'])
export class TenantPhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'phone_e164', type: 'varchar', length: 20, nullable: false })
  phoneE164!: string;

  @Column({ name: 'provider_key', type: 'varchar', length: 40, nullable: false })
  providerKey!: string;

  @Column({ name: 'provider_external_id', type: 'varchar', length: 100, nullable: false })
  providerExternalId!: string;

  @Column({
    name: 'provisioned_by',
    type: 'enum',
    enum: PhoneProvisionedBy,
    enumName: 'tenant_phone_numbers_provisioned_by_enum',
    nullable: false,
  })
  provisionedBy!: PhoneProvisionedBy;

  @Column({ name: 'monthly_message_count', type: 'int', nullable: false, default: 0 })
  monthlyMessageCount!: number;

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt!: Date | null;

  @Column({
    name: 'purchased_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  purchasedAt!: Date;

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
