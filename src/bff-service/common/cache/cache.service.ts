import { firstValueFrom, lastValueFrom, timeout } from 'rxjs';
import { RedisData, SaveRedisData, VerifyRedisData } from '../redis/model/redis-data';
import { RedisEvent } from '../redis/model/redis-event';
import { Inject, Injectable } from '@nestjs/common';
import { ProxyKey } from '../proxy/constance';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CacheService {
  @Inject(ProxyKey)
  public readonly client!: ClientProxy;

  public async getFromCache<T>(data: RedisData): Promise<T | null> {
    return await lastValueFrom(this.client.send<T, RedisData>(RedisEvent.Get, data).pipe(timeout(5000)));
  }

  public async saveInCache<T>(data: SaveRedisData<T>): Promise<void> {
    await lastValueFrom(this.client.send<object, SaveRedisData<T>>(RedisEvent.Save, data).pipe(timeout(5000)));
  }

  public async updateInCache<T>(data: SaveRedisData<T>): Promise<void> {
    await lastValueFrom(this.client.send<object, SaveRedisData<T>>(RedisEvent.Save, data).pipe(timeout(5000)));
  }

  public async removeFromCache(data: RedisData): Promise<void> {
    await firstValueFrom(this.client.send<object, RedisData>(RedisEvent.Remove, data).pipe(timeout(5000)));
  }

  public async checkExistsInCache(data: RedisData): Promise<boolean> {
    return await firstValueFrom(this.client.send<boolean, RedisData>(RedisEvent.CheckExist, data).pipe(timeout(5000)));
  }

  public async verifyInCache(data: VerifyRedisData): Promise<boolean> {
    return await firstValueFrom(
      this.client.send<boolean, VerifyRedisData>(RedisEvent.Verify, data).pipe(timeout(5000)),
    );
  }
}
