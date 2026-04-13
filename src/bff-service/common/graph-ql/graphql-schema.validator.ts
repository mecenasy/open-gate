/**
 * GraphQL Schema Validator
 * Validates GraphQL schema on startup to catch structural issues early
 */

import { buildSchema, validateSchema, GraphQLSchema } from 'graphql';
import { Logger } from '@nestjs/common';

export class GraphQLSchemaValidator {
  private readonly logger = new Logger('GraphQLSchemaValidator');

  /**
   * Validate GraphQL schema string
   * Throws error if schema is invalid
   */
  validateSchema(schemaString: string): GraphQLSchema {
    try {
      const schema = buildSchema(schemaString);
      const errors = validateSchema(schema);

      if (errors && errors.length > 0) {
        const errorMessages = errors.map((error) => error.message).join('\n');
        this.logger.error(`GraphQL schema validation failed:\n${errorMessages}`);
        throw new Error('GraphQL schema validation failed');
      }

      const typeCount = Object.keys(schema.getTypeMap()).length;
      this.logger.log(`✓ GraphQL schema is valid (${typeCount} types)`);
      return schema;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Schema parsing failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate schema file exists and is not empty
   */
  validateSchemaFile(schemaPath: string, fs: any): boolean {
    try {
      if (!fs.existsSync(schemaPath)) {
        this.logger.warn(`GraphQL schema file not found at: ${schemaPath}`);
        return false;
      }

      const stats = fs.statSync(schemaPath);
      if (stats.size === 0) {
        this.logger.warn(`GraphQL schema file is empty: ${schemaPath}`);
        return false;
      }

      this.logger.log(`✓ GraphQL schema file is valid (${stats.size} bytes)`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to validate schema file: ${error.message}`);
      }
      return false;
    }
  }
}
