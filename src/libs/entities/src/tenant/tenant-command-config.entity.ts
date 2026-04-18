import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'tenant_command_config', schema: 'shared_config' })
@Unique(['tenantId', 'commandName'])
export class TenantCommandConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId!: string;

  @Column({ name: 'command_name', type: 'text', nullable: false })
  commandName!: string;

  @Column({ name: 'active', type: 'boolean', default: true, nullable: false })
  active!: boolean;

  @Column({ name: 'parameters_override', type: 'jsonb', nullable: true })
  parametersOverride!: Record<string, boolean> | null;

  @Column({ name: 'user_types', type: 'jsonb', default: [] })
  userTypes!: string[];

  @Column({ name: 'actions', type: 'jsonb', nullable: true })
  actions!: Record<string, boolean> | null;

  @Column({ name: 'description_i18n', type: 'jsonb', nullable: true })
  descriptionI18n!: Record<string, string> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
