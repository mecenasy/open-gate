import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TypeConfigService } from '../config/types.config.service';
import { Config } from '../config/redis.config';

export const initRedis = (app: INestApplication) => {
  const config = app.get(TypeConfigService);
  const redisUri = app.get(TypeConfigService)?.getOrThrow<Config>('redis')?.redisUri;
  const tls = redisUri.startsWith('rediss') ? { rejectUnauthorized: false } : undefined;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config.getOrThrow<Config>('redis')?.redisHost,
      port: +(config.getOrThrow<Config>('redis')?.redisPort ?? 0),
      password: config.getOrThrow<Config>('redis')?.redisPassword,
      tls,
    },
  });
};

export const startMicroservices = async (app: INestApplication) => {
  try {
    await app.startAllMicroservices();
  } catch (error) {
    console.error('BŁĄD POŁĄCZENIA Z REDISEM:', error);
  }
};
