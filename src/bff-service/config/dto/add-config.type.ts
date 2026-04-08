import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class AddConfigType {
  @Field()
  @IsString()
  @IsNotEmpty()
  key!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  value!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
