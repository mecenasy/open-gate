import { IsString } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum Type {
  Message = 'message',
  Error = 'error',
}

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
    enum: Type,
    default: Type.Message,
  })
  type: Type;
}
