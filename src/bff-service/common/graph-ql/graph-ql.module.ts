import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { Context } from '../types/context';
import { JSONScalarDefinition } from './scalars/json.scalar';
import { GraphqlExceptionFilter } from '../filters/graphql-exception.filter';

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
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
  ],
})
export class GraphQlModule {}
