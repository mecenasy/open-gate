import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { JSONScalarDefinition } from './scalars/json.scalar';
import { GraphqlExceptionFilter } from '../filters/graphql-exception.filter';
import { GraphQLSchemaValidator } from './graphql-schema.validator';
import { Context } from '@app/auth';

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
      cors: false,
      subscriptions: {
        'graphql-ws': true,
      },
      onSchemaChange: (schema) => {
        // Validate schema on startup and changes
        new GraphQLSchemaValidator().validateSchema(schema.getQueryType()?.toString() || '');
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
export class GraphQlModule {
  constructor() {
    // Validate schema file on module initialization
    const schemaPath = join(process.cwd(), 'src/bff-service/common/graph-ql/schema.gql');
    const validator = new GraphQLSchemaValidator();

    // Check if schema file exists and is valid
    if (existsSync(schemaPath)) {
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      try {
        validator.validateSchema(schemaContent);
      } catch (error) {
        console.warn('GraphQL schema validation suppressed (schema may not be fully generated yet)');
      }
    }
  }
}
