import { IsString } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Messages {
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
  value: string;
}
