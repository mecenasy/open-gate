import { ObjectType } from '@nestjs/graphql';
import * as GraphQLJSON from 'graphql-type-json';

@ObjectType('JSON')
export class JSONScalar {
  static get type() {
    return GraphQLJSON;
  }
}

export const JSONScalarDefinition = {
  type: GraphQLJSON,
  description: 'JSON scalar type',
};
