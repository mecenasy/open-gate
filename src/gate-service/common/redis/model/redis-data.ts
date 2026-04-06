export interface RedisData {
  identifier: string;
  prefix?: string;
}

export interface SaveRedisData<T = string | number> extends RedisData {
  data: T;
  EX?: number;
}

export interface VerifyRedisData<T = string | number> extends RedisData {
  data: T;
}
