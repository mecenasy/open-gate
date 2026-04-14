import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { GraphqlExceptionFilter } from './graphql-exception.filter';

describe('GraphqlExceptionFilter', () => {
  let filter: GraphqlExceptionFilter;

  beforeEach(() => {
    filter = new GraphqlExceptionFilter();
  });

  const call = (exception: unknown) => filter.catch(exception, {} as any);

  it('should return a GraphQLError instance', () => {
    const result = call(new Error('fail'));
    expect(result).toBeInstanceOf(GraphQLError);
  });

  describe('HttpException', () => {
    it('should use exception status and message for HttpException', () => {
      const result = call(new ForbiddenException('no access'));
      const parsed = JSON.parse(result.message);

      expect(parsed.statusCode).toBe(403);
      expect(parsed.message).toBe('no access');
    });

    it('should handle NotFoundException', () => {
      const result = call(new NotFoundException('not found'));
      const parsed = JSON.parse(result.message);

      expect(parsed.statusCode).toBe(404);
    });

    it('should handle InternalServerErrorException', () => {
      const result = call(new InternalServerErrorException('boom'));
      const parsed = JSON.parse(result.message);

      expect(parsed.statusCode).toBe(500);
    });

    it('should extract message from object response body', () => {
      const ex = new HttpException({ message: 'validation failed', code: 'INVALID' }, 422);
      const result = call(ex);
      const parsed = JSON.parse(result.message);

      expect(parsed.message).toBe('validation failed');
      expect(parsed.statusCode).toBe(422);
    });
  });

  describe('BadRequestException', () => {
    it('should handle BadRequestException with string message', () => {
      const result = call(new BadRequestException('bad input'));
      const parsed = JSON.parse(result.message);

      expect(parsed.statusCode).toBe(400);
      expect(parsed.message).toBe('bad input');
    });
  });

  describe('generic Error', () => {
    it('should use error message for plain Error', () => {
      const result = call(new Error('unexpected'));
      const parsed = JSON.parse(result.message);

      expect(parsed.message).toBe('unexpected');
      expect(parsed.statusCode).toBe(500);
    });

    it('should include a timestamp in the error response', () => {
      const result = call(new Error('ts test'));
      const parsed = JSON.parse(result.message);

      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp).getTime()).not.toBeNaN();
    });

    it('should set extensions.code on the GraphQLError', () => {
      const result = call(new BadRequestException('err'));

      expect(result.extensions?.code).toBeDefined();
    });
  });
});
