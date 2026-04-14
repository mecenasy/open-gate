import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { CommunityCustomization } from '@app/customization';
import { DEFAULT_CUSTOMIZATION } from '@app/customization';

export type {
  CommunityCustomization,
  CommunityCustomizationBranding,
  CommunityCustomizationFeatures,
  CommunityCustomizationMessaging,
  CommunityCustomizationCommands,
  CommunityCustomizationCompliance,
  MessagingChannel,
} from '@app/customization';
export { DEFAULT_CUSTOMIZATION, validateMessagingChannels } from '@app/customization';

@Entity({ name: 'customization_config', schema: 'shared_config' })
export class CustomizationConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'tenant_id',
    type: 'uuid',
    nullable: false,
  })
  tenantId!: string;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: () => `'${JSON.stringify(DEFAULT_CUSTOMIZATION)}'`,
  })
  config!: CommunityCustomization;

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
