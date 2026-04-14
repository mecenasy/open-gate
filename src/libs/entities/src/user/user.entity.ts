import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { History } from './history.entity';
import { UserSettings } from './user-settings.entity';
import { Password } from './password.entity';
import { PassKey } from '../auth/passkey.entity';
import { UserStatus } from '../enums/user-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @IsEmail()
  email!: string;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true,
    nullable: true,
  })
  @IsPhoneNumber()
  phone!: string;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @IsString()
  name!: string;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @IsString()
  surname!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Pending,
  })
  status!: UserStatus;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  @IsString()
  ownerId!: string;

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

  @ManyToOne(() => UserRole, (userRole) => userRole.user, { cascade: true })
  @JoinColumn()
  userRole!: UserRole;

  @OneToMany(() => History, (history) => history.user, {
    cascade: true,
    nullable: true,
  })
  authHistories!: History[];

  @OneToOne(() => UserSettings, (settings) => settings.user, {
    cascade: true,
    nullable: false,
  })
  userSettings!: UserSettings;

  @OneToOne(() => Password, (password) => password.user, {
    cascade: true,
    nullable: true,
  })
  password?: Password;

  @OneToMany(() => PassKey, (passkey) => passkey.user, {
    cascade: true,
    nullable: true,
  })
  passkey!: PassKey[];
}
