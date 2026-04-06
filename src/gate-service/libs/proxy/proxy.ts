import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TypeConfigService } from '../../configs/types.config.service';
import { RedisConfig } from 'src/user-service/common/redis/config/redis.config';

export const initProxy = async (app: INestApplication) => {
  const config = app.get(TypeConfigService);
  const redisUri = app.get(TypeConfigService)?.getOrThrow<RedisConfig>('redis')?.redisUri;
  const tls = redisUri.startsWith('rediss') ? { rejectUnauthorized: false } : undefined;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config.getOrThrow<RedisConfig>('redis')?.redisHost,
      port: +(config.getOrThrow<RedisConfig>('redis')?.redisPort ?? 0),
      password: config.getOrThrow<RedisConfig>('redis')?.redisPassword,
      tls,
    },
  });

  await app.startAllMicroservices().catch((err) => {
    console.error('BŁĄD POŁĄCZENIA Z REDISEM:', err);
  });
};
