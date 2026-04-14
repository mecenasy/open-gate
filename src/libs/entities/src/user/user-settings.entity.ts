import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { RiskToleranceLevel } from '../enums/risk-tolerance.enum';

@Entity('user_settings')
export class UserSettings {
  @Column({
    name: 'is_two_factor_enabled',
    type: 'boolean',
    default: false,
  })
  isTwoFactorEnabled!: boolean;

  @Column({
    name: 'two_factor_secret',
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  twoFactorSecret!: string | null;

  @Column({
    name: 'is_adaptive_auth_enabled',
    type: 'boolean',
    default: false,
  })
  isAdaptiveAuthEnabled!: boolean;

  @Column('enum', {
    name: 'risk_tolerance_level',
    enum: RiskToleranceLevel,
    default: RiskToleranceLevel.MEDIUM,
  })
  riskToleranceLevel!: RiskToleranceLevel;

  @OneToOne(() => User, (user) => user.userSettings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'user_id' })
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  user!: User;
}
