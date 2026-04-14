import { IsEnum, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../enums/user-type.enum';

@Entity('prompts')
@Unique(['userType', 'key', 'commandName'])
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  @IsString()
  key!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  commandName!: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.User,
  })
  @IsEnum(UserType)
  userType!: UserType;

  @Column({
    type: 'text',
    nullable: false,
  })
  @IsString()
  description!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @IsString()
  prompt!: string;

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
