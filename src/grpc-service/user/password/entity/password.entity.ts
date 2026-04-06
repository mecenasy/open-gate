import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../entity/user.entity';
import { PassKey } from '../../../auth/passkey/entity/passkey.entity';

@Entity()
export class Password {
  @PrimaryColumn({ type: 'uuid' })
  userId!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  hash!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  salt!: string;

  @OneToOne(() => User, (user) => user.password, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToOne(() => Password, (password) => password.user, {
    cascade: true,
    nullable: true,
  })
  password!: Password;

  @OneToMany(() => PassKey, (passkey) => passkey.user, {
    cascade: true,
    nullable: true,
  })
  passkey!: PassKey[];
}
