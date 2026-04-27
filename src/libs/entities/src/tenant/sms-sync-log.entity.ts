import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Append-only daily SMS sync log keyed by (tenant_id, sync_date). The
 * counter cron upserts one row per tenant per UTC day so re-runs become
 * no-ops. messages_counted reflects the delta added during that sync,
 * not the running total — total lives on tenant_phone_numbers.
 */
@Entity({ name: 'sms_sync_log', schema: 'shared_config' })
@Index('IDX_sms_sync_log_tenant_date', ['tenantId', 'syncDate'])
export class SmsSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'sync_date', type: 'date', nullable: false })
  syncDate!: string;

  @Column({ name: 'messages_counted', type: 'int', nullable: false, default: 0 })
  messagesCounted!: number;

  @CreateDateColumn({
    name: 'synced_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  syncedAt!: Date;
}
