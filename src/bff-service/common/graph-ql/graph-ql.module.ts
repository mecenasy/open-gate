import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { Context } from '../types/context';
import { JSONScalarDefinition } from './scalars/json.scalar';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      context: ({ req, res }: Context) => ({ req, res }),
      autoSchemaFile: join(process.cwd(), 'src/bff-service/common/graph-ql/schema.gql'),
      resolvers: { JSON: JSONScalarDefinition.type },
      playground: true,
      introspection: true,
      debug: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
  ],
})
export class GraphQlModule {}
