export interface RedisData {
  identifier: string;
  prefix?: string;
  path?: string;
}

export interface SaveRedisData<T> extends RedisData {
  data: T;
  NX?: boolean;
  EX?: number;
}

export interface VerifyRedisData<T> extends RedisData {
  data: T;
}
