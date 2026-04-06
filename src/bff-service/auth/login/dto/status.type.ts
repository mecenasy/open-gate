import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AuthStatus } from '../../types/login-status';

registerEnumType(AuthStatus, { name: 'AuthStatus' });
@ObjectType()
export class StatusType {
  @Field(() => AuthStatus, { nullable: false })
  status!: AuthStatus;
}
