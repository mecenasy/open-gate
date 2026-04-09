import { Field, ObjectType } from '@nestjs/graphql';
import { ConfigType } from './config.type';

@ObjectType()
export class ConfigResponseType {
  @Field()
  status!: boolean;

  @Field()
  message!: string;

  @Field(() => ConfigType, { nullable: true })
  data?: ConfigType;
}

@ObjectType()
export class ConfigsListType {
  @Field()
  status!: boolean;

  @Field()
  message!: string;

  @Field(() => [ConfigType])
  data!: ConfigType[];
}
