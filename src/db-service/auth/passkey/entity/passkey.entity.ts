import { User } from '../../../user/entity/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pass-key')
export class PassKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'credential_id',
    unique: true,
  })
  credentialID!: string;

  @Column({ type: 'bytea' })
  publicKey!: Buffer;

  @Column({ default: 0 })
  counter!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'devicename', nullable: true })
  deviceName!: string;

  @ManyToOne(() => User, (user) => user.passkey, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  user!: User;
}
