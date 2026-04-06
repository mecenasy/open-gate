import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entity/user.entity';
import { RiskReason } from '../../../../types/risk-reason';

@Index(['fingerprintHash', 'userId'])
@Entity('auth_histories')
export class History {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id',
    unsigned: true,
  })
  id!: number;

  @Column({
    name: 'last_ip',
    length: 40,
  })
  lastIp!: string;

  @Column({
    name: 'fingerprint_hash',
    type: 'varchar',
    unique: true,
  })
  fingerprintHash!: string;

  @Column({
    name: 'country',
    type: 'varchar',
    length: 2,
  })
  country!: string;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
  })
  city!: string;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 255,
  })
  userAgent!: string;

  @Column({
    name: 'is_trusted',
    type: 'boolean',
    default: false,
  })
  isTrusted!: boolean;

  @Column({
    name: 'mfa_passed',
    type: 'boolean',
    default: true,
  })
  mfaPassed!: boolean;

  @Column({
    name: 'failure_count',
    type: 'integer',
    default: 0,
  })
  failureCount!: number;

  @Column({
    name: 'last_failure_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastFailureAt!: Date | null;

  @UpdateDateColumn({
    name: 'updatedAt',
  })
  updatedAt!: Date;

  @CreateDateColumn({
    name: 'createdAt',
  })
  createdAt!: Date;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId!: string | null;

  @Column({
    name: 'last_score',
    type: 'integer',
    default: 0,
  })
  lastScore!: number;

  @Column({
    name: 'risk_reasons',
    type: 'jsonb',
    enum: RiskReason,
    default: [],
  })
  riskReasons!: RiskReason[];

  @ManyToOne(() => User, (user) => user.authHistories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user!: User;
}
