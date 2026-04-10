import { RedisJSON } from 'redis';

export interface RedisData {
  identifier: string;
  prefix?: string;
  path?: string;
}

export interface SaveRedisData<T extends RedisJSON> extends RedisData {
  data: T;
  EX?: number;
}

export interface VerifyRedisData<T extends RedisJSON> extends RedisData {
  data: T;
}
