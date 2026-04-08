import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ToggleActiveStatusType {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Field()
  @IsBoolean()
  active!: boolean;
}
