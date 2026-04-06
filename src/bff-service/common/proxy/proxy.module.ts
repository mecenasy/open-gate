/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcDbProxyKey, GrpcNotifyProxyKey, ProxyKey } from './constance';
import { join } from 'path';
import { TypeConfigService } from '../configs/types.config.service';
import { RedisConfig } from '../redis/config/redis.config';
import { getGrpcOptions } from 'src/utils/get-proto-files';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ProxyKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: TypeConfigService) => {
          const redisUri = configService.getOrThrow<RedisConfig>('redis')?.redisUri;
          const tls = redisUri.startsWith('rediss') ? { rejectUnauthorized: false } : undefined;

          return {
            transport: Transport.REDIS,
            options: {
              host: configService.get<RedisConfig>('redis')?.redisHost,
              port: +(configService.get<RedisConfig>('redis')?.redisPort ?? 0),
              password: configService.get<RedisConfig>('redis')?.redisPassword,
              tls,
            },
          };
        },
      },
      {
        name: GrpcDbProxyKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: TypeConfigService) => ({
          transport: Transport.GRPC,
          options: {
            ...getGrpcOptions(join(__dirname, '../../../proto')),
            url: configService.get<RedisConfig>('redis')?.grpcUrl,
            onLoadPackageDefinition: (pkg, server) => {
              new (require('@grpc/reflection').ReflectionService)(pkg).addToServer(server);
            },
          },
        }),
      },
      {
        name: GrpcNotifyProxyKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: TypeConfigService) => ({
          transport: Transport.GRPC,
          options: {
            ...getGrpcOptions(join(__dirname, '../../../proto')),
            url: configService.get<RedisConfig>('redis')?.notifyGrpcUrl,
            onLoadPackageDefinition: (pkg, server) => {
              new (require('@grpc/reflection').ReflectionService)(pkg).addToServer(server);
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class ProxyModule {}
