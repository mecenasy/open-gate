import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToOne,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Command } from '../../command/entity/command.entity';
import { User } from './user.entity';
import { UserType } from '../user-type';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description!: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  @IsEnum(UserType)
  userType!: UserType;

  @OneToMany(() => User, (user) => user.userRole)
  user!: User;

  @ManyToMany(() => Command, (command) => command.userRoles)
  commands!: Command[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
