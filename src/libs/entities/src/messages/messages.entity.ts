import { IsString } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MessageType } from '../enums/message-type.enum';

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

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.Message,
  })
  type: MessageType;
}
