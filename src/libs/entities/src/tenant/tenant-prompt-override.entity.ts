import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { UserType } from '../enums/user-type.enum';

/**
 * Per-tenant prompt overrides stored in shared_config schema.
 * Priority chain (most specific first):
 *   1. tenant + command + userType
 *   2. tenant + null    + userType  (general tenant prompt)
 *   3. global prompts table         (fallback)
 *
 * commandId = null means a general context prompt (not tied to a specific command).
 */
@Entity({ name: 'tenant_prompt_override', schema: 'shared_config' })
@Unique(['tenantId', 'commandId', 'userType'])
export class TenantPromptOverride {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'command_id', type: 'uuid', nullable: true })
  commandId!: string | null;

  @Column({
    name: 'user_type',
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  userType!: UserType;

  @Column({ name: 'description_i18n', type: 'jsonb', nullable: true })
  descriptionI18n!: Record<string, string> | null;

  @Column({ name: 'prompt', type: 'text', nullable: false })
  prompt!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
