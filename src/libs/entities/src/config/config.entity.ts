import { IsString, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConfigType } from '../enums/config-type.enum';

@Entity('configs')
export class Config {
  @PrimaryColumn({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  @IsString()
  key: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  @IsString()
  value: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({
    name: 'config_type',
    type: 'enum',
    enum: ConfigType,
    default: ConfigType.Feature,
  })
  configType: ConfigType;

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
