import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QrChallengeType {
  @Field()
  challenge: string;

  @Field()
  dataUrl: string;
}
