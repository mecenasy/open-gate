import { Field, ObjectType } from '@nestjs/graphql';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

@ObjectType()
export class AcceptType extends StatusType {
  @Field()
  dataUrl!: string;
}
