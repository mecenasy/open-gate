import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'tenants', schema: 'shared_config' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  slug!: string;

  @Column({
    name: 'schema_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  schemaName!: string;

  @Column({
    name: 'customization_id',
    type: 'uuid',
    nullable: true,
  })
  customizationId!: string | null;

  @Column({
    name: 'billing_user_id',
    type: 'uuid',
    nullable: true,
  })
  billingUserId!: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
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
