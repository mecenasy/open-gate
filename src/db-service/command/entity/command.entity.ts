import { IsBoolean, IsArray, IsJSON, IsString, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserRole } from '../../user/entity/user-role.entity';

@Entity('commands')
export class Command {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @IsString()
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description: string;

  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  @IsBoolean()
  active: boolean;

  @Column({
    type: 'jsonb',
    default: {},
    nullable: false,
  })
  @IsJSON()
  actions: Record<string, boolean>;

  @Column({
    type: 'jsonb',
    default: {},
    nullable: false,
  })
  @IsJSON()
  parameters: Record<string, boolean>;

  @ManyToMany(() => UserRole, (role) => role.commands, { cascade: true })
  @JoinTable({
    name: 'command_permissions',
    joinColumn: {
      name: 'command_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  userRoles: UserRole[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
