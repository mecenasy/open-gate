import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Per-tenant platform credentials stored in shared_config schema.
 * platform field matches notify-service Platform enum values:
 *   'signal' | 'sms' | 'smtp' | 'whatsapp' | 'messenger'
 *
 * config shapes per platform:
 *   signal:    { apiUrl: string; account: string }
 *   sms:       { sid: string; token: string; phone: string ; bundleSid: string }
 *   smtp:      { host: string; port: number; user: string; password: string; from: string }
 *   whatsapp:  { phoneNumberId: string; accessToken: string }
 *   messenger: { pageAccessToken: string; pageId: string }
 */
@Entity({ name: 'platform_credentials', schema: 'shared_config' })
export class PlatformCredentials {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column()
  platform!: string;

  @Column({ type: 'jsonb' })
  config!: Record<string, unknown>;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
