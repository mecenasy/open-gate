import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @IsEmail()
  email: string;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true,
    nullable: true,
  })
  @IsPhoneNumber()
  phone: string;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @IsString()
  name: string;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @IsString()
  surname: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToOne(() => UserRole, (userRole) => userRole.user, { cascade: true })
  @JoinColumn()
  userRole: UserRole;

  @Column({
    type: 'boolean',
    default: false,
  })
  suspended: boolean;
}
