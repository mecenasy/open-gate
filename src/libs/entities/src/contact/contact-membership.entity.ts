import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { ContactAccessLevel } from '../enums/contact-access-level.enum';

@Entity({ name: 'contact_memberships', schema: 'shared_config' })
export class ContactMembership {
  @PrimaryColumn({ name: 'contact_id', type: 'uuid' })
  contactId!: string;

  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({
    name: 'access_level',
    type: 'enum',
    enum: ContactAccessLevel,
    enumName: 'contact_access_level',
    default: ContactAccessLevel.Primary,
    nullable: false,
  })
  accessLevel!: ContactAccessLevel;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
