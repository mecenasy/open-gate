import { Inject, Injectable } from '@nestjs/common';
import { RedisJSON, type RedisClientType } from 'redis';
import { RedisData, SaveRedisData, VerifyRedisData } from '../model/redis-data';
import { RedisClientKey } from './redis-keys';

@Injectable()
export class RedisService {
  constructor(@Inject(RedisClientKey) private readonly redis: RedisClientType) {}

  public async verify<T extends RedisJSON>({ data, ...rest }: VerifyRedisData<T>): Promise<boolean> {
    const savedCode = await this.get(rest);

    if (savedCode == data) {
      await this.remove(rest);
      return true;
    }

    return false;
  }

  public async save<T extends RedisJSON>({ data, identifier, EX = 300, prefix }: SaveRedisData<T>): Promise<void> {
    const key = this.getIdentifier(identifier, prefix);

    await this.redis.multi().json.set(key, '$', data).expire(key, EX).exec();
  }

  public async get<T extends RedisJSON>({ identifier, prefix, path = '' }: RedisData): Promise<T | null> {
    const key = this.getIdentifier(identifier, prefix);
    const result = await this.redis.json.get(key, {
      path: path ? `$.${path}` : '$',
    });

    return (Array.isArray(result) ? result[0] : result) as T;
  }

  public async update<T extends RedisJSON>({
    identifier,
    prefix,
    path = '',
    data,
    EX = 300,
  }: SaveRedisData<T>): Promise<T | null> {
    const key = this.getIdentifier(identifier, prefix);

    await this.redis
      .multi()
      .json.merge(key, path ? `$.${path}` : '$', data)
      .expire(key, EX)
      .exec();

    return null;
  }

  public async checkExist({ identifier, prefix, path }: RedisData): Promise<boolean> {
    const key = this.getIdentifier(identifier, prefix);

    const result = await this.redis.json.get(key, { path: path ? `$.${path}` : '$' });
    const checkData = (Array.isArray(result) ? result[0] : result) as RedisJSON;

    return Boolean(checkData);
  }

  public async remove({ identifier, prefix }: RedisData): Promise<void> {
    const key = this.getIdentifier(identifier, prefix);
    await this.redis.json.del(key);
  }

  private getIdentifier(identifier: string, prefix?: string) {
    return prefix ? `${prefix}:${identifier}` : `otp:${identifier}`;
  }
}
