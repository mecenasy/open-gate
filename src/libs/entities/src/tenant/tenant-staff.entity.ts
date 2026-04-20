import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TenantStaffRole } from '../enums/tenant-staff-role.enum';

@Entity({ name: 'tenant_staff', schema: 'shared_config' })
export class TenantStaff {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: TenantStaffRole,
    enumName: 'tenant_staff_role',
    nullable: false,
  })
  role!: TenantStaffRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
