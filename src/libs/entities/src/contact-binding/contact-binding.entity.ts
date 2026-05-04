import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BindingPlatform } from '../enums/binding-platform.enum';
import { ContactBindingSendStatus } from '../enums/contact-binding-send-status.enum';
import { ContactBindingSource } from '../enums/contact-binding-source.enum';
import { ContactBindingStatus } from '../enums/contact-binding-status.enum';

@Entity({ name: 'contact_bindings', schema: 'shared_config' })
@Index('IDX_contact_bindings_tenant_phone_status', ['tenantId', 'phoneE164', 'status'])
@Index('IDX_contact_bindings_user_id', ['userId'])
export class ContactBinding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @Column({ name: 'phone_e164', type: 'varchar', length: 20, nullable: false })
  phoneE164!: string;

  @Column({ type: 'varchar', length: 32, unique: true, nullable: false })
  token!: string;

  @Column({
    type: 'enum',
    enum: BindingPlatform,
    enumName: 'binding_platform',
    nullable: false,
  })
  platform!: BindingPlatform;

  @Column({
    type: 'enum',
    enum: ContactBindingStatus,
    enumName: 'contact_binding_status',
    default: ContactBindingStatus.Pending,
    nullable: false,
  })
  status!: ContactBindingStatus;

  @Column({
    type: 'enum',
    enum: ContactBindingSource,
    enumName: 'contact_binding_source',
    nullable: false,
  })
  source!: ContactBindingSource;

  @Column({ name: 'outbound_message_id', type: 'varchar', length: 64, nullable: true })
  outboundMessageId!: string | null;

  @Column({
    name: 'send_status',
    type: 'enum',
    enum: ContactBindingSendStatus,
    enumName: 'contact_binding_send_status',
    default: ContactBindingSendStatus.Pending,
    nullable: false,
  })
  sendStatus!: ContactBindingSendStatus;

  @Column({ name: 'send_error', type: 'text', nullable: true })
  sendError!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
  expiresAt!: Date;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;

  @Column({ name: 'identity_id', type: 'uuid', nullable: true })
  identityId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
