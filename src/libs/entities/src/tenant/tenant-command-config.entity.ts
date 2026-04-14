import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

/**
 * Per-tenant command configuration stored in shared_config schema.
 * Allows enabling/disabling global commands per tenant and overriding default parameters.
 */
@Entity({ name: 'tenant_command_config', schema: 'shared_config' })
@Unique(['tenantId', 'commandId'])
export class TenantCommandConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'command_id', type: 'uuid', nullable: false })
  commandId!: string;

  @Column({ name: 'active', type: 'boolean', default: true, nullable: false })
  active!: boolean;

  @Column({ name: 'parameters_override', type: 'jsonb', nullable: true })
  parametersOverride!: Record<string, boolean> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
