import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { BindingPlatform } from '../enums/binding-platform.enum';

@Entity({ name: 'platform_identities', schema: 'shared_config' })
@Unique('UQ_platform_identities_tenant_platform_user', ['tenantId', 'platform', 'platformUserId'])
@Index('IDX_platform_identities_tenant_phone', ['tenantId', 'phoneE164'])
@Index('IDX_platform_identities_user_id', ['userId'])
export class PlatformIdentity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @Column({
    type: 'enum',
    enum: BindingPlatform,
    enumName: 'binding_platform',
    nullable: false,
  })
  platform!: BindingPlatform;

  @Column({ name: 'platform_user_id', type: 'varchar', length: 255, nullable: false })
  platformUserId!: string;

  @Column({ name: 'phone_e164', type: 'varchar', length: 20, nullable: true })
  phoneE164!: string | null;

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: false })
  verifiedAt!: Date;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
