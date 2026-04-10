import { Inject, Injectable } from '@nestjs/common';
import { type RedisClientType } from 'redis';
import { RedisData, SaveRedisData, VerifyRedisData } from '../model/redis-data';
import { RedisClientKey } from './redis-keys';

@Injectable()
export class RedisService {
  constructor(@Inject(RedisClientKey) private readonly redis: RedisClientType) {}

  public async verify<T>({ data, ...rest }: VerifyRedisData<T>): Promise<boolean> {
    const savedCode = await this.get(rest);

    if (savedCode == data) {
      await this.remove(rest);
      return true;
    }

    return false;
  }

  public async save<T>({ data, identifier, EX = 300, prefix }: SaveRedisData<T>): Promise<void> {
    const key = this.getIdentifier(identifier, prefix);

    await this.redis.set(key, JSON.stringify(data), { EX });
  }

  public async get<T>({ identifier, prefix }: RedisData): Promise<T | null> {
    const key = this.getIdentifier(identifier, prefix);
    const data: string | null = await this.redis.get(key);

    return data ? (JSON.parse(data) as T) : null;
  }

  public async update<T>({ identifier, prefix, data, EX }: SaveRedisData<T>): Promise<T | null> {
    const key = this.getIdentifier(identifier, prefix);
    const result: string | null = await this.redis.get(key);

    let newData: T;

    if (result) {
      const parsedData = JSON.parse(result) as unknown;
      if (typeof data === 'object' && data !== null && typeof parsedData === 'object' && parsedData !== null) {
        newData = { ...parsedData, ...data } as T;
      } else {
        newData = data;
      }
    } else {
      newData = data;
    }
    await this.redis.set(key, JSON.stringify(newData), { EX });

    return null;
  }

  public async checkExist({ identifier, prefix }: RedisData): Promise<boolean> {
    const key = this.getIdentifier(identifier, prefix);

    return Boolean(await this.redis.get(key));
  }

  public async remove({ identifier, prefix }: RedisData): Promise<void> {
    const key = this.getIdentifier(identifier, prefix);
    await this.redis.del(key);
  }

  private getIdentifier(identifier: string, prefix?: string) {
    return prefix ? `${prefix}:${identifier}` : `otp:${identifier}`;
  }
}
